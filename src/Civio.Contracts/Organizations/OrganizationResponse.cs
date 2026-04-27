namespace Civio.Contracts.Organizations;

public sealed record OrganizationResponse(
    Guid Id,
    Guid OwnerUserId,
    string Name,
    string Status,
    string? Description,
    string? Email,
    string? Phone,
    string? Website,
    DateTime CreatedAt
);
