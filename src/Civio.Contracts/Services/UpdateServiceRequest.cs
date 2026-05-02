namespace Civio.Contracts.Services;

public sealed record UpdateServiceRequest(
    string Name,
    string? Description,
    int DurationMinutes,
    decimal? Price,
    Guid? CategoryId
);
