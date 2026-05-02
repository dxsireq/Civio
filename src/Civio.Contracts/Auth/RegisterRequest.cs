using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Auth;

public sealed record RegisterRequest(
    [property: Required, EmailAddress, MaxLength(256)]
    string Email,
    [property: Required, MinLength(8), MaxLength(100)]
    string Password,
    [property: Required, MaxLength(100)]
    string FirstName,
    [property: Required, MaxLength(100)]
    string LastName,
    [property: MaxLength(100)]
    string? MiddleName,
    [property: Phone, MaxLength(20)]
    string? Phone);
