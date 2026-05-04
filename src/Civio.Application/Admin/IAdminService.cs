using Civio.Contracts.Admin;
using Civio.Contracts.Organizations;

namespace Civio.Application.Admin;

public interface IAdminService
{
    Task<IReadOnlyList<OrganizationResponse>> GetAllOrganizationsAsync(
        CancellationToken cancellationToken = default);

    Task<OrganizationResponse> ApproveOrganizationAsync(
        Guid organizationId,
        Guid moderatorId,
        ModerationRequest request,
        CancellationToken cancellationToken = default);

    Task<OrganizationResponse> RejectOrganizationAsync(
        Guid organizationId,
        Guid moderatorId,
        ModerationRequest request,
        CancellationToken cancellationToken = default);

    Task<OrganizationResponse> BlockOrganizationAsync(
        Guid organizationId,
        Guid moderatorId,
        ModerationRequest request,
        CancellationToken cancellationToken = default);
}
