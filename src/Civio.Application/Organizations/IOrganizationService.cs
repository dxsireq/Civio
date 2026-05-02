using Civio.Contracts.Organizations;

namespace Civio.Application.Organizations;

public interface IOrganizationService
{
    Task<OrganizationResponse> CreateAsync(
        Guid ownerUserId,
        CreateOrganizationRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<OrganizationResponse>> GetMyAsync(
        Guid ownerUserId,
        CancellationToken cancellationToken = default);

    Task<OrganizationResponse> GetByIdAsync(
        Guid id,
        Guid requestingUserId,
        CancellationToken cancellationToken = default);

    Task<OrganizationResponse> UpdateAsync(
        Guid id,
        Guid requestingUserId,
        UpdateOrganizationRequest request,
        CancellationToken cancellationToken = default);
}
