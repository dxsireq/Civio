using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Auth;

public sealed record ChangePasswordRequest(
    [property: Required(ErrorMessage = "Введите текущий пароль"),
               MinLength(8, ErrorMessage = "Пароль должен содержать минимум 8 символов"),
               MaxLength(100, ErrorMessage = "Пароль не должен превышать 100 символов")]
    string CurrentPassword,
    [property: Required(ErrorMessage = "Введите новый пароль"),
               MinLength(8, ErrorMessage = "Пароль должен содержать минимум 8 символов"),
               MaxLength(100, ErrorMessage = "Пароль не должен превышать 100 символов")]
    string NewPassword);
