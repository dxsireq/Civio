using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Auth;

public sealed record UpdateProfileRequest(
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
