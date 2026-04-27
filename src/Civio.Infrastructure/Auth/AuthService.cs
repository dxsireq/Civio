using Civio.Application.Auth;
using Civio.Contracts.Auth;
using Civio.Domain.Entities;
using Civio.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Civio.Infrastructure.Auth;

public sealed class AuthService : IAuthService
{
    private readonly AppDbContext _dbContext;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public AuthService(
        AppDbContext dbContext,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _dbContext = dbContext;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponse> RegisterAsync(
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

        var roles = new[] { citizenRole.Name };
        var token = _jwtTokenGenerator.GenerateToken(user, roles);

        return new AuthResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            token);
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
            roles);
    }
}
