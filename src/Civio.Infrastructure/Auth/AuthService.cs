using System.Security.Cryptography;
using System.Text;
using Civio.Application.Auth;
using Civio.Application.Notifications;
using Civio.Contracts.Auth;
using Civio.Domain.Entities;
using Civio.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Civio.Infrastructure.Auth;

public sealed class AuthService : IAuthService
{
    private readonly AppDbContext _dbContext;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<AuthService> _logger;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public AuthService(
        AppDbContext dbContext,
        IJwtTokenGenerator jwtTokenGenerator,
        IEmailSender emailSender,
        ILogger<AuthService> logger)
    {
        _dbContext = dbContext;
        _jwtTokenGenerator = jwtTokenGenerator;
        _emailSender = emailSender;
        _logger = logger;
    }

    public async Task<RegisterResponse> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var emailExists = await _dbContext.Users
            .AnyAsync(x => x.Email == normalizedEmail, cancellationToken);

        if (emailExists)
            throw new InvalidOperationException("User with this email already exists.");

        var citizenRole = await _dbContext.Roles
            .FirstOrDefaultAsync(x => x.Name == "Citizen", cancellationToken);

        if (citizenRole is null)
            throw new InvalidOperationException("Default role 'Citizen' was not found.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            Phone = request.Phone,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            MiddleName = request.MiddleName?.Trim(),
            IsActive = true,
            IsEmailVerified = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        user.UserRoles.Add(new UserRole
        {
            UserId = user.Id,
            RoleId = citizenRole.Id
        });

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await IssueCodeAsync(user, cancellationToken);

        return new RegisterResponse(user.Email);
    }

    public async Task<AuthResponse> VerifyEmailAsync(
        VerifyEmailRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _dbContext.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Email == normalizedEmail, cancellationToken);

        if (user is null)
            throw new UnauthorizedAccessException("Invalid email or verification code.");

        if (user.IsEmailVerified)
        {
            // Idempotent: already verified — just return a token
            var existingRoles = user.UserRoles.Select(x => x.Role.Name).ToArray();
            return new AuthResponse(user.Id, user.Email, user.FirstName, user.LastName,
                _jwtTokenGenerator.GenerateToken(user, existingRoles));
        }

        var code = await _dbContext.EmailVerificationCodes
            .Where(x => x.UserId == user.Id && x.ConsumedAt == null)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (code is null || code.ExpiresAt < DateTimeOffset.UtcNow)
        {
            if (code is not null)
            {
                code.ConsumedAt = DateTimeOffset.UtcNow;
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
            throw new InvalidOperationException("Код подтверждения истёк. Запросите новый код.");
        }

        code.Attempts++;

        if (code.Attempts > 5)
        {
            code.ConsumedAt = DateTimeOffset.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
            throw new InvalidOperationException("Превышено число попыток. Запросите новый код.");
        }

        var submittedHash = Hash(request.Code);

        if (!string.Equals(code.CodeHash, submittedHash, StringComparison.Ordinal))
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
            throw new InvalidOperationException("Неверный код подтверждения.");
        }

        user.IsEmailVerified = true;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        code.ConsumedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        var roles = user.UserRoles.Select(x => x.Role.Name).ToArray();
        var token = _jwtTokenGenerator.GenerateToken(user, roles);

        return new AuthResponse(user.Id, user.Email, user.FirstName, user.LastName, token);
    }

    public async Task ResendCodeAsync(
        ResendCodeRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(x => x.Email == normalizedEmail, cancellationToken);

        if (user is null || user.IsEmailVerified)
        {
            // Avoid email enumeration: silently succeed
            return;
        }

        var recentCode = await _dbContext.EmailVerificationCodes
            .Where(x => x.UserId == user.Id && x.ConsumedAt == null)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (recentCode is not null && recentCode.CreatedAt > DateTimeOffset.UtcNow.AddSeconds(-60))
            throw new InvalidOperationException("Пожалуйста, подождите перед повторной отправкой кода.");

        await IssueCodeAsync(user, cancellationToken);
    }

    public async Task<AuthResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _dbContext.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Email == normalizedEmail, cancellationToken);

        if (user is null)
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("User is inactive.");

        var verificationResult = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password);

        if (verificationResult == PasswordVerificationResult.Failed)
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!user.IsEmailVerified)
            throw new EmailNotVerifiedException();

        var roles = user.UserRoles
            .Select(x => x.Role.Name)
            .ToArray();

        var token = _jwtTokenGenerator.GenerateToken(user, roles);

        return new AuthResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            token);
    }

    public async Task<CurrentUserResponse> GetCurrentUserAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);

        if (user is null)
            throw new UnauthorizedAccessException("User was not found.");

        var roles = user.UserRoles
            .Select(x => x.Role.Name)
            .ToArray();

        return new CurrentUserResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.MiddleName,
            user.Phone,
            roles);
    }

    public async Task<CurrentUserResponse> UpdateProfileAsync(
        Guid userId,
        UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);

        if (user is null)
            throw new UnauthorizedAccessException("User was not found.");

        var newPhone = string.IsNullOrWhiteSpace(request.Phone)
            ? null
            : request.Phone.Trim();

        if (newPhone is not null && newPhone != user.Phone)
        {
            var phoneTaken = await _dbContext.Users
                .AnyAsync(x => x.Id != userId && x.Phone == newPhone, cancellationToken);

            if (phoneTaken)
                throw new InvalidOperationException("Phone is already in use.");
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.MiddleName = string.IsNullOrWhiteSpace(request.MiddleName)
            ? null
            : request.MiddleName.Trim();
        user.Phone = newPhone;
        user.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        var roles = user.UserRoles
            .Select(x => x.Role.Name)
            .ToArray();

        return new CurrentUserResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.MiddleName,
            user.Phone,
            roles);
    }

    public async Task ChangePasswordAsync(
        Guid userId,
        ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users
            .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);

        if (user is null)
            throw new UnauthorizedAccessException("User was not found.");

        var verification = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.CurrentPassword);

        if (verification == PasswordVerificationResult.Failed)
            throw new InvalidOperationException("Current password is incorrect.");

        user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
        user.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task IssueCodeAsync(User user, CancellationToken cancellationToken)
    {
        // Revoke all prior unconsumed codes for this user
        var existing = await _dbContext.EmailVerificationCodes
            .Where(x => x.UserId == user.Id && x.ConsumedAt == null)
            .ToListAsync(cancellationToken);

        foreach (var old in existing)
            old.ConsumedAt = DateTimeOffset.UtcNow;

        var plainCode = GenerateCode();

        var entry = new EmailVerificationCode
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            CodeHash = Hash(plainCode),
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(10),
            CreatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.EmailVerificationCodes.Add(entry);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Dev aid: log plaintext code when SMTP not configured (SmtpEmailSender will log + skip)
        _logger.LogInformation(
            "Email verification code for {Email}: {Code} (expires {ExpiresAt})",
            user.Email, plainCode, entry.ExpiresAt);

        var subject = "Код подтверждения регистрации Civio";
        var body =
            $"Ваш код подтверждения: {plainCode}\n\n" +
            "Код действителен в течение 10 минут.\n\n" +
            "Если вы не регистрировались на платформе Civio, проигнорируйте это письмо.";

        await _emailSender.SendAsync(user.Email, subject, body, cancellationToken);
    }

    private static string GenerateCode() =>
        Random.Shared.Next(0, 1_000_000).ToString("D6");

    private static string Hash(string code) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(code)));
}
