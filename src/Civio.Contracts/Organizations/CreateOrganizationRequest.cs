namespace Civio.Contracts.Organizations;

public sealed record CreateOrganizationRequest(
    string Name,
    string? Description,
    string? Email,
    string? Phone,
    string? Website
);
