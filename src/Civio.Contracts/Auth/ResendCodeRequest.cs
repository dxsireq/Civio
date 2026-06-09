using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Auth;

public sealed record ResendCodeRequest(
    [property: Required(ErrorMessage = "Введите email"),
               EmailAddress(ErrorMessage = "Некорректный формат email")]
    string Email);
