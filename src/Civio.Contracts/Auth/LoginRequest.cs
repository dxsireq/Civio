using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Auth;

public sealed record LoginRequest(
    [property: Required(ErrorMessage = "Введите email"),
               EmailAddress(ErrorMessage = "Некорректный формат email")]
    string Email,
    [property: Required(ErrorMessage = "Введите пароль")]
    string Password);
