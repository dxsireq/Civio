using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Auth;

public sealed record UpdateProfileRequest(
    [property: Required, MaxLength(100)]
    string FirstName,
    [property: Required, MaxLength(100)]
    string LastName,
    [property: MaxLength(100)]
    string? MiddleName,
    [property: Phone, MaxLength(20)]
    string? Phone);
