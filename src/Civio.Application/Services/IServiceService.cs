using Civio.Contracts.Services;

namespace Civio.Application.Services;

public interface IServiceService
{
    Task<ServiceResponse> CreateAsync(
        Guid organizationId,
        Guid requestingUserId,
        CreateServiceRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ServiceResponse>> GetByOrganizationAsync(
        Guid organizationId,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse> UpdateAsync(
        Guid serviceId,
        Guid organizationId,
        Guid requestingUserId,
        UpdateServiceRequest request,
        CancellationToken cancellationToken = default);

    Task DeactivateAsync(
        Guid serviceId,
        Guid organizationId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default);
}
