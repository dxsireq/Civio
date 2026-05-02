using Civio.Contracts.Employees;

namespace Civio.Application.Employees;

public interface IEmployeeService
{
    Task<EmployeeResponse> CreateAsync(
        Guid organizationId,
        Guid requestingUserId,
        CreateEmployeeRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<EmployeeResponse>> GetByOrganizationAsync(
        Guid organizationId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default);

    Task<EmployeeResponse> GetByIdAsync(
        Guid id,
        Guid organizationId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default);

    Task<EmployeeResponse> UpdateAsync(
        Guid id,
        Guid organizationId,
        Guid requestingUserId,
        UpdateEmployeeRequest request,
        CancellationToken cancellationToken = default);

    Task DeactivateAsync(
        Guid id,
        Guid organizationId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default);
}
