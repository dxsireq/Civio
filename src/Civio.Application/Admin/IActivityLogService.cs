using Civio.Contracts.Admin;

namespace Civio.Application.Admin;

public interface IActivityLogService
{
    Task<ActivityLogPageDto> GetActivityLogAsync(
        string? entityType,
        Guid? actorId,
        DateTimeOffset? from,
        DateTimeOffset? to,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
}
