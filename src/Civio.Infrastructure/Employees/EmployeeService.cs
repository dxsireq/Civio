using Civio.Application.Employees;
using Civio.Contracts.Employees;
using Civio.Contracts.Services;
using Civio.Domain.Authorization;
using Civio.Domain.Entities;
using Civio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Civio.Infrastructure.Employees;

public sealed class EmployeeService : IEmployeeService
{
    private readonly AppDbContext _dbContext;

    public EmployeeService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
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

        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("First name is required.");

        if (string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("Last name is required.");

        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            UserId = request.UserId,
            FirstName = firstName,
            LastName = lastName,
            MiddleName = NormalizeNullable(request.MiddleName),
            Position = NormalizeNullable(request.Position),
            Phone = NormalizeNullable(request.Phone),
            Email = NormalizeNullable(request.Email),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.Employees.Add(employee);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(employee);
    }

    public async Task<IReadOnlyList<EmployeeResponse>> GetByOrganizationAsync(
        Guid organizationId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var organization = await _dbContext.Organizations
            .AsNoTracking()
            .Include(o => o.Employees)
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (organization is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        var hasAccess = OrganizationAccess.IsOwner(requestingUserId, organization)
            || OrganizationAccess.IsEmployee(requestingUserId, organizationId, organization.Employees);

        if (!hasAccess)
            throw new UnauthorizedAccessException("Access denied.");

        return organization.Employees
            .Where(e => e.IsActive)
            .OrderBy(e => e.LastName)
            .ThenBy(e => e.FirstName)
            .Select(ToResponse)
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
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (organization is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        var hasAccess = OrganizationAccess.IsOwner(requestingUserId, organization)
            || OrganizationAccess.IsEmployee(requestingUserId, organizationId, organization.Employees);

        if (!hasAccess)
            throw new UnauthorizedAccessException("Access denied.");

        var employee = organization.Employees.FirstOrDefault(e => e.Id == id && e.IsActive);

        if (employee is null)
            throw new KeyNotFoundException($"Employee {id} not found.");

        return ToResponse(employee);
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

        return ToResponse(employee);
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
        _dbContext.Entry(employee).Property(e => e.IsActive).IsModified = true;

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

        return await _dbContext.EmployeeServices
            .AsNoTracking()
            .Where(es => es.EmployeeId == employeeId)
            .Select(es => new ServiceResponse(
                es.Service.Id,
                es.Service.OrganizationId,
                es.Service.CategoryId,
                es.Service.Name,
                es.Service.Description,
                es.Service.DurationMinutes,
                es.Service.Price,
                es.Service.IsActive,
                es.Service.CreatedAt.UtcDateTime))
            .ToListAsync(cancellationToken);
    }

    private static EmployeeResponse ToResponse(Employee e) =>
        new(
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
            e.CreatedAt.UtcDateTime);

    private static string? NormalizeNullable(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
