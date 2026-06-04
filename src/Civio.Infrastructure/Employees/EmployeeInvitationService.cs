using Civio.Application.Auth;
using Civio.Application.Employees;
using Civio.Application.Notifications;
using Civio.Contracts.Auth;
using Civio.Contracts.Invitations;
using Civio.Domain.Authorization;
using Civio.Domain.Entities;
using Civio.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Civio.Infrastructure.Employees;

public sealed class EmployeeInvitationService : IEmployeeInvitationService
{
    private readonly AppDbContext _dbContext;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly PasswordHasher<User> _passwordHasher = new();
    private readonly IEmailSender _emailSender;
    private readonly AppOptions _appOptions;

    public EmployeeInvitationService(
        AppDbContext dbContext,
        IJwtTokenGenerator jwtTokenGenerator,
        IEmailSender emailSender,
        IOptions<AppOptions> appOptions)
    {
        _dbContext = dbContext;
        _jwtTokenGenerator = jwtTokenGenerator;
        _emailSender = emailSender;
        _appOptions = appOptions.Value;
    }

    public async Task<InvitationInfoResponse> GetByTokenAsync(
        string token,
        CancellationToken cancellationToken = default)
    {
        var invitation = await _dbContext.EmployeeInvitations
            .AsNoTracking()
            .Include(i => i.Employee)
            .Include(i => i.Organization)
            .FirstOrDefaultAsync(i => i.Token == token, cancellationToken);

        if (invitation is null)
            throw new KeyNotFoundException("Invitation not found.");

        // Auto-mark expired
        var resolvedStatus = invitation.Status;
        if (resolvedStatus == "pending" && invitation.ExpiresAt < DateTimeOffset.UtcNow)
        {
            var tracked = await _dbContext.EmployeeInvitations
                .FirstOrDefaultAsync(i => i.Token == token, cancellationToken);
            if (tracked is not null)
            {
                tracked.Status = "expired";
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
            resolvedStatus = "expired";
        }

        var userExists = await _dbContext.Users
            .AsNoTracking()
            .AnyAsync(u => u.Email == invitation.Email, cancellationToken);

        return new InvitationInfoResponse(
            invitation.Email,
            invitation.Employee.FirstName,
            invitation.Employee.LastName,
            invitation.Employee.MiddleName,
            invitation.Employee.Phone,
            invitation.Employee.Position,
            invitation.Organization.Name,
            userExists,
            resolvedStatus,
            invitation.ExpiresAt);
    }

    public async Task<AuthResponse> AcceptWithRegistrationAsync(
        string token,
        AcceptInvitationRegisterRequest request,
        CancellationToken cancellationToken = default)
    {
        var invitation = await _dbContext.EmployeeInvitations
            .Include(i => i.Employee)
            .FirstOrDefaultAsync(i => i.Token == token, cancellationToken);

        if (invitation is null)
            throw new KeyNotFoundException("Invitation not found.");

        if (invitation.Status != "pending")
            throw new InvalidOperationException($"Invitation is {invitation.Status}.");

        if (invitation.ExpiresAt < DateTimeOffset.UtcNow)
        {
            invitation.Status = "expired";
            await _dbContext.SaveChangesAsync(cancellationToken);
            throw new InvalidOperationException("Invitation has expired.");
        }

        var emailExists = await _dbContext.Users
            .AnyAsync(u => u.Email == invitation.Email, cancellationToken);

        if (emailExists)
            throw new InvalidOperationException("A user with this email already exists. Please log in and accept the invitation.");

        var citizenRole = await _dbContext.Roles
            .FirstOrDefaultAsync(r => r.Name == "Citizen", cancellationToken)
            ?? throw new InvalidOperationException("Role 'Citizen' not found.");

        var employeeRole = await _dbContext.Roles
            .FirstOrDefaultAsync(r => r.Name == "OrganizationEmployee", cancellationToken)
            ?? throw new InvalidOperationException("Role 'OrganizationEmployee' not found.");

        var firstName = string.IsNullOrWhiteSpace(request.FirstName)
            ? invitation.Employee.FirstName
            : request.FirstName.Trim();

        var lastName = string.IsNullOrWhiteSpace(request.LastName)
            ? invitation.Employee.LastName
            : request.LastName.Trim();

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = invitation.Email,
            Phone = string.IsNullOrWhiteSpace(request.Phone) ? invitation.Employee.Phone : request.Phone.Trim(),
            FirstName = firstName,
            LastName = lastName,
            MiddleName = string.IsNullOrWhiteSpace(request.MiddleName) ? invitation.Employee.MiddleName : request.MiddleName.Trim(),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = citizenRole.Id });
        user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = employeeRole.Id });

        _dbContext.Users.Add(user);

        invitation.Employee.UserId = user.Id;
        invitation.Employee.IsActive = true;
        invitation.Employee.UpdatedAt = DateTimeOffset.UtcNow;

        invitation.Status = "accepted";
        invitation.AcceptedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        var roles = new[] { citizenRole.Name, employeeRole.Name };
        var jwtToken = _jwtTokenGenerator.GenerateToken(user, roles);

        return new AuthResponse(user.Id, user.Email, user.FirstName, user.LastName, jwtToken);
    }

    public async Task AcceptAsync(
        string token,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var invitation = await _dbContext.EmployeeInvitations
            .Include(i => i.Employee)
            .FirstOrDefaultAsync(i => i.Token == token, cancellationToken);

        if (invitation is null)
            throw new KeyNotFoundException("Invitation not found.");

        if (invitation.Status != "pending")
            throw new InvalidOperationException($"Invitation is {invitation.Status}.");

        if (invitation.ExpiresAt < DateTimeOffset.UtcNow)
        {
            invitation.Status = "expired";
            await _dbContext.SaveChangesAsync(cancellationToken);
            throw new InvalidOperationException("Invitation has expired.");
        }

        var user = await _dbContext.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user is null)
            throw new UnauthorizedAccessException("User not found.");

        if (!string.Equals(user.Email, invitation.Email, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("Your email does not match the invitation.");

        // Assign OrganizationEmployee role if not already present
        var employeeRole = await _dbContext.Roles
            .FirstOrDefaultAsync(r => r.Name == "OrganizationEmployee", cancellationToken)
            ?? throw new InvalidOperationException("Role 'OrganizationEmployee' not found.");

        var hasRole = user.UserRoles.Any(ur => ur.RoleId == employeeRole.Id);
        if (!hasRole)
        {
            _dbContext.UserRoles.Add(new UserRole { UserId = userId, RoleId = employeeRole.Id });
        }

        invitation.Employee.UserId = userId;
        invitation.Employee.IsActive = true;
        invitation.Employee.UpdatedAt = DateTimeOffset.UtcNow;

        invitation.Status = "accepted";
        invitation.AcceptedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task RevokeAsync(
        Guid organizationId,
        Guid employeeId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var organization = await _dbContext.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (organization is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        if (!OrganizationAccess.IsOwner(requestingUserId, organization))
            throw new UnauthorizedAccessException("Only the owner can revoke invitations.");

        var employee = await _dbContext.Employees
            .Include(e => e.Invitations)
            .FirstOrDefaultAsync(e => e.Id == employeeId && e.OrganizationId == organizationId, cancellationToken);

        if (employee is null)
            throw new KeyNotFoundException($"Employee {employeeId} not found.");

        if (employee.UserId is not null)
            throw new InvalidOperationException("Employee has already accepted the invitation.");

        var pendingInvite = employee.Invitations
            .FirstOrDefault(i => i.Status == "pending");

        if (pendingInvite is not null)
        {
            pendingInvite.Status = "revoked";
        }

        // Remove the pending employee record entirely (no membership was established)
        _dbContext.Employees.Remove(employee);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task ResendAsync(
        Guid organizationId,
        Guid employeeId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var organization = await _dbContext.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (organization is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        if (!OrganizationAccess.IsOwner(requestingUserId, organization))
            throw new UnauthorizedAccessException("Only the owner can resend invitations.");

        var employee = await _dbContext.Employees
            .Include(e => e.Invitations)
            .FirstOrDefaultAsync(e => e.Id == employeeId && e.OrganizationId == organizationId, cancellationToken);

        if (employee is null)
            throw new KeyNotFoundException($"Employee {employeeId} not found.");

        if (employee.UserId is not null)
            throw new InvalidOperationException("Employee has already accepted the invitation.");

        // Revoke current pending invitation
        foreach (var inv in employee.Invitations.Where(i => i.Status == "pending"))
        {
            inv.Status = "revoked";
        }

        // Create new invitation
        var newToken = EmployeeService.GenerateToken();
        var newInvitation = new EmployeeInvitation
        {
            Id = Guid.NewGuid(),
            EmployeeId = employeeId,
            OrganizationId = organizationId,
            Email = employee.Email!,
            Token = newToken,
            Status = "pending",
            InvitedBy = requestingUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7)
        };

        _dbContext.EmployeeInvitations.Add(newInvitation);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var userExists = await _dbContext.Users
            .AsNoTracking()
            .AnyAsync(u => u.Email == employee.Email, cancellationToken);

        var inviteLink = $"{_appOptions.WebClientBaseUrl.TrimEnd('/')}/invite/{newToken}";
        var subject = $"Приглашение в организацию «{organization.Name}»";
        var body = userExists
            ? $"Вас приглашают присоединиться к организации «{organization.Name}».\n\nВойдите в систему и примите приглашение по ссылке:\n{inviteLink}"
            : $"Вас приглашают присоединиться к организации «{organization.Name}».\n\nЗарегистрируйтесь и начните работу по ссылке:\n{inviteLink}";

        await _emailSender.SendAsync(employee.Email!, subject, body, cancellationToken);
    }
}
