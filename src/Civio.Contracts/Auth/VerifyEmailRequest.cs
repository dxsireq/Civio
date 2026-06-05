using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Auth;

public sealed record VerifyEmailRequest(
    [property: Required, EmailAddress]
    string Email,
    [property: Required, RegularExpression(@"^\d{6}$", ErrorMessage = "Code must be 6 digits.")]
    string Code);
