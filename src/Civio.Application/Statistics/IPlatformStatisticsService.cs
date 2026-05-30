using Civio.Contracts.Statistics;

namespace Civio.Application.Statistics;

public interface IPlatformStatisticsService
{
    Task<PlatformStatisticsResponse> GetAsync(
        DateTimeOffset from,
        DateTimeOffset to,
        CancellationToken cancellationToken = default);
}
