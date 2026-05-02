using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Organizations;

public sealed record CreateOrganizationRequest(
    [property: Required, MaxLength(200)]
    string Name,
    [property: MaxLength(1000)]
    string? Description,
    [property: EmailAddress, MaxLength(256)]
    string? Email,
    [property: Phone, MaxLength(20)]
    string? Phone,
    [property: Url, MaxLength(500)]
    string? Website
);
