namespace Civio.Contracts.Services;

public sealed record ServiceResponse(
    Guid Id,
    Guid OrganizationId,
    Guid? CategoryId,
    string Name,
    string? Description,
    int DurationMinutes,
    decimal? Price,
    bool IsActive,
    DateTime CreatedAt
);
