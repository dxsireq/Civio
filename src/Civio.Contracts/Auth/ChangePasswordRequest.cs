using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Auth;

public sealed record ChangePasswordRequest(
    [property: Required, MinLength(8), MaxLength(100)]
    string CurrentPassword,
    [property: Required, MinLength(8), MaxLength(100)]
    string NewPassword);
