using Civio.Application.Employees;
using Civio.Contracts.Employees;
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
            BranchId = request.BranchId,
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

        var employee = organization.Employees.FirstOrDefault(e => e.Id == id);

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
        employee.BranchId = request.BranchId;
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

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static EmployeeResponse ToResponse(Employee e) =>
        new(
            e.Id,
            e.OrganizationId,
            e.BranchId,
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
