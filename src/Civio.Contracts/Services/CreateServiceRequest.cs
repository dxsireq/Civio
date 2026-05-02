namespace Civio.Contracts.Services;

public sealed record CreateServiceRequest(
    string Name,
    string? Description,
    int DurationMinutes,
    decimal? Price,
    Guid? CategoryId
);
