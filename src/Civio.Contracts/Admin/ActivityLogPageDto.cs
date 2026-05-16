namespace Civio.Contracts.Admin;

public record ActivityLogPageDto(
    IReadOnlyList<ActivityLogItemDto> Items,
    int Total,
    int Page,
    int PageSize);
