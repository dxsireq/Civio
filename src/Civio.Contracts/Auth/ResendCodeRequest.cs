using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Auth;

public sealed record ResendCodeRequest(
    [property: Required, EmailAddress]
    string Email);
