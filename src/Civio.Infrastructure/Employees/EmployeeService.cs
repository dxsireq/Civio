using System.Security.Cryptography;
using Civio.Application.Employees;
using Civio.Application.Notifications;
using Civio.Contracts.Employees;
using Civio.Contracts.Services;
using Civio.Domain.Authorization;
using Civio.Domain.Entities;
using Civio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Civio.Infrastructure.Employees;

public sealed class EmployeeService : IEmployeeService
{
    private readonly AppDbContext _dbContext;
    private readonly IEmailSender _emailSender;
    private readonly AppOptions _appOptions;

    public EmployeeService(
        AppDbContext dbContext,
        IEmailSender emailSender,
        IOptions<AppOptions> appOptions)
    {
        _dbContext = dbContext;
        _emailSender = emailSender;
        _appOptions = appOptions.Value;
    }

    public async Task<EmployeeResponse> CreateAsync(
        Guid organizationId,
        Guid requestingUserId,
        CreateEmployeeRequest request,
        CancellationToken cancellationToken = default)
    {
        var organization = await _dbContext.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (organization is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        if (!OrganizationAccess.IsOwner(requestingUserId, organization))
            throw new UnauthorizedAccessException("Only the owner can add employees.");

        var firstName = request.FirstName.Trim();
        var lastName = request.LastName.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("First name is required.");

        if (string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("Last name is required.");

        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required.");

        // Prevent duplicate: active or pending employee with same email in this org
        var duplicate = await _dbContext.Employees
            .AsNoTracking()
            .AnyAsync(e => e.OrganizationId == organizationId
                && e.Email == email
                && (e.UserId != null || _dbContext.EmployeeInvitations
                    .Any(i => i.EmployeeId == e.Id && i.Status == "pending")),
                cancellationToken);

        if (duplicate)
            throw new InvalidOperationException("An employee with this email already exists in the organization.");

        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            UserId = null,
            FirstName = firstName,
            LastName = lastName,
            MiddleName = NormalizeNullable(request.MiddleName),
            Position = NormalizeNullable(request.Position),
            Phone = NormalizeNullable(request.Phone),
            Email = email,
            IsActive = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var token = GenerateToken();
        var invitation = new EmployeeInvitation
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            OrganizationId = organizationId,
            Email = email,
            Token = token,
            Status = "pending",
            InvitedBy = requestingUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7)
        };

        _dbContext.Employees.Add(employee);
        _dbContext.EmployeeInvitations.Add(invitation);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Send invitation email (no-op in dev if SMTP not configured)
        var userExists = await _dbContext.Users
            .AsNoTracking()
            .AnyAsync(u => u.Email == email, cancellationToken);

        var inviteLink = $"{_appOptions.WebClientBaseUrl.TrimEnd('/')}/invite/{token}";
        var subject = $"Приглашение в организацию «{organization.Name}»";
        var body = userExists
            ? $"Вас приглашают присоединиться к организации «{organization.Name}».\n\nВойдите в систему и примите приглашение по ссылке:\n{inviteLink}"
            : $"Вас приглашают присоединиться к организации «{organization.Name}».\n\nЗарегистрируйтесь и начните работу по ссылке:\n{inviteLink}";

        await _emailSender.SendAsync(email, subject, body, cancellationToken);

        return ToResponse(employee, invitation.Status);
    }

    public async Task<IReadOnlyList<EmployeeResponse>> GetByOrganizationAsync(
        Guid organizationId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var organization = await _dbContext.Organizations
            .AsNoTracking()
            .Include(o => o.Employees)
            .ThenInclude(e => e.Invitations)
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (organization is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        var hasAccess = OrganizationAccess.IsOwner(requestingUserId, organization)
            || OrganizationAccess.IsEmployee(requestingUserId, organizationId, organization.Employees);

        if (!hasAccess)
            throw new UnauthorizedAccessException("Access denied.");

        // Owner sees all (active, pending, fired); employees see only active
        var employees = OrganizationAccess.IsOwner(requestingUserId, organization)
            ? organization.Employees
            : organization.Employees.Where(e => e.IsActive);

        return employees
            .OrderBy(e => e.LastName)
            .ThenBy(e => e.FirstName)
            .Select(e => ToResponse(e, LatestInvitationStatus(e)))
            .ToList();
    }

    public async Task<EmployeeResponse> GetByIdAsync(
        Guid id,
        Guid organizationId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var organization = await _dbContext.Organizations
            .AsNoTracking()
            .Include(o => o.Employees)
            .ThenInclude(e => e.Invitations)
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (organization is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        var hasAccess = OrganizationAccess.IsOwner(requestingUserId, organization)
            || OrganizationAccess.IsEmployee(requestingUserId, organizationId, organization.Employees);

        if (!hasAccess)
            throw new UnauthorizedAccessException("Access denied.");

        var employee = organization.Employees.FirstOrDefault(e => e.Id == id);

        if (employee is null)
            throw new KeyNotFoundException($"Employee {id} not found.");

        return ToResponse(employee, LatestInvitationStatus(employee));
    }

    public async Task<EmployeeResponse> UpdateAsync(
        Guid id,
        Guid organizationId,
        Guid requestingUserId,
        UpdateEmployeeRequest request,
        CancellationToken cancellationToken = default)
    {
        var organization = await _dbContext.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (organization is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        if (!OrganizationAccess.IsOwner(requestingUserId, organization))
            throw new UnauthorizedAccessException("Only the owner can update employees.");

        var employee = await _dbContext.Employees
            .Include(e => e.Invitations)
            .FirstOrDefaultAsync(e => e.Id == id && e.OrganizationId == organizationId, cancellationToken);

        if (employee is null)
            throw new KeyNotFoundException($"Employee {id} not found.");

        var firstName = request.FirstName.Trim();
        var lastName = request.LastName.Trim();

        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("First name is required.");

        if (string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("Last name is required.");

        employee.FirstName = firstName;
        employee.LastName = lastName;
        employee.MiddleName = NormalizeNullable(request.MiddleName);
        employee.Position = NormalizeNullable(request.Position);
        employee.Phone = NormalizeNullable(request.Phone);
        employee.Email = NormalizeNullable(request.Email);
        employee.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(employee, LatestInvitationStatus(employee));
    }

    public async Task DeactivateAsync(
        Guid id,
        Guid organizationId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var organization = await _dbContext.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (organization is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        if (!OrganizationAccess.IsOwner(requestingUserId, organization))
            throw new UnauthorizedAccessException("Only the owner can deactivate employees.");

        var employee = await _dbContext.Employees
            .FirstOrDefaultAsync(e => e.Id == id && e.OrganizationId == organizationId, cancellationToken);

        if (employee is null)
            throw new KeyNotFoundException($"Employee {id} not found.");

        employee.IsActive = false;
        employee.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AssignServiceAsync(
        Guid employeeId,
        Guid organizationId,
        Guid serviceId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var org = await _dbContext.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (org is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        if (!OrganizationAccess.IsOwner(requestingUserId, org))
            throw new UnauthorizedAccessException("Only the owner can assign services.");

        var employee = await _dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == employeeId && e.OrganizationId == organizationId && e.IsActive, cancellationToken);

        if (employee is null)
            throw new KeyNotFoundException($"Employee {employeeId} not found.");

        var service = await _dbContext.Services
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.OrganizationId == organizationId && s.IsActive, cancellationToken);

        if (service is null)
            throw new KeyNotFoundException($"Service {serviceId} not found.");

        var alreadyAssigned = await _dbContext.EmployeeServices
            .AnyAsync(es => es.EmployeeId == employeeId && es.ServiceId == serviceId, cancellationToken);

        if (alreadyAssigned)
            return;

        _dbContext.EmployeeServices.Add(new Domain.Entities.EmployeeService
        {
            EmployeeId = employeeId,
            ServiceId = serviceId
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UnassignServiceAsync(
        Guid employeeId,
        Guid organizationId,
        Guid serviceId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var org = await _dbContext.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (org is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        if (!OrganizationAccess.IsOwner(requestingUserId, org))
            throw new UnauthorizedAccessException("Only the owner can unassign services.");

        var link = await _dbContext.EmployeeServices
            .FirstOrDefaultAsync(es => es.EmployeeId == employeeId && es.ServiceId == serviceId, cancellationToken);

        if (link is null)
            return;

        _dbContext.EmployeeServices.Remove(link);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ServiceResponse>> GetServicesAsync(
        Guid employeeId,
        Guid organizationId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var org = await _dbContext.Organizations
            .AsNoTracking()
            .Include(o => o.Employees)
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (org is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        var hasAccess = OrganizationAccess.IsOwner(requestingUserId, org)
            || OrganizationAccess.IsEmployee(requestingUserId, organizationId, org.Employees);

        if (!hasAccess)
            throw new UnauthorizedAccessException("Access denied.");

        var links = await _dbContext.EmployeeServices
            .AsNoTracking()
            .Where(es => es.EmployeeId == employeeId)
            .Include(es => es.Service)
            .ToListAsync(cancellationToken);

        return links.Select(es => new ServiceResponse(
                es.Service.Id,
                es.Service.OrganizationId,
                es.Service.CategoryId,
                es.Service.Name,
                es.Service.Description,
                es.Service.DurationMinutes,
                es.Service.Price,
                es.Service.IsActive,
                es.Service.CreatedAt.UtcDateTime))
            .ToList();
    }

    public async Task<IReadOnlyList<EmployeeWithOrgResponse>> GetMyAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Employees
            .AsNoTracking()
            .Where(e => e.UserId == userId && e.IsActive)
            .Include(e => e.Organization)
            .ThenInclude(o => o.Status)
            .OrderBy(e => e.Organization.Name)
            .Select(e => new EmployeeWithOrgResponse(
                e.Id,
                e.OrganizationId,
                e.Organization.Name,
                e.Organization.City,
                e.Organization.Status.Code,
                e.FirstName,
                e.LastName,
                e.MiddleName,
                e.Position,
                e.Phone,
                e.Email,
                e.IsActive))
            .ToListAsync(cancellationToken);
    }

    private static EmployeeResponse ToResponse(Employee e, string? invitationStatus)
    {
        var membershipStatus = e.UserId.HasValue
            ? (e.IsActive ? "active" : "fired")
            : "pending";

        return new EmployeeResponse(
            e.Id,
            e.OrganizationId,
            e.UserId,
            e.FirstName,
            e.LastName,
            e.MiddleName,
            e.Position,
            e.Phone,
            e.Email,
            e.IsActive,
            e.CreatedAt.UtcDateTime,
            membershipStatus,
            e.UserId.HasValue ? null : invitationStatus);
    }

    private static string? LatestInvitationStatus(Employee e) =>
        e.Invitations
            .OrderByDescending(i => i.CreatedAt)
            .FirstOrDefault()
            ?.Status;

    internal static string GenerateToken()
    {
        var bytes = new byte[32];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes)
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }

    private static string? NormalizeNullable(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
