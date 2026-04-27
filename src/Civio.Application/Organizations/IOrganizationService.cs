using Civio.Contracts.Organizations;

namespace Civio.Application.Organizations;

public interface IOrganizationService
{
    Task<OrganizationResponse> CreateAsync(
        Guid ownerUserId,
        CreateOrganizationRequest request,
        CancellationToken cancellationToken = default);
}
