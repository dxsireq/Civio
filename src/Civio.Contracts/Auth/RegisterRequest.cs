using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Auth;

public sealed record RegisterRequest(
    [property: Required(ErrorMessage = "Введите email"),
               EmailAddress(ErrorMessage = "Некорректный формат email"),
               MaxLength(256, ErrorMessage = "Email не должен превышать 256 символов")]
    string Email,
    [property: Required(ErrorMessage = "Введите пароль"),
               MinLength(8, ErrorMessage = "Пароль должен содержать минимум 8 символов"),
               MaxLength(100, ErrorMessage = "Пароль не должен превышать 100 символов")]
    string Password,
    [property: Required(ErrorMessage = "Введите имя"),
               MaxLength(100, ErrorMessage = "Имя не должно превышать 100 символов")]
    string FirstName,
    [property: Required(ErrorMessage = "Введите фамилию"),
               MaxLength(100, ErrorMessage = "Фамилия не должна превышать 100 символов")]
    string LastName,
    [property: MaxLength(100, ErrorMessage = "Отчество не должно превышать 100 символов")]
    string? MiddleName,
    [property: Phone(ErrorMessage = "Некорректный формат телефона"),
               MaxLength(20, ErrorMessage = "Телефон не должен превышать 20 символов")]
    string? Phone);
