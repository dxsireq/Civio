using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Auth;

public sealed record LoginRequest(
    [property: Required, EmailAddress]
    string Email,
    [property: Required]
    string Password);
