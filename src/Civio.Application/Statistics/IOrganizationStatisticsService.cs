using Civio.Contracts.Statistics;

namespace Civio.Application.Statistics;

public interface IOrganizationStatisticsService
{
    Task<OrganizationStatisticsResponse> GetAsync(
        Guid organizationId,
        Guid requestingUserId,
        DateTimeOffset from,
        DateTimeOffset to,
        CancellationToken cancellationToken = default);
}
