using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Organizations;

public sealed record UpdateOrganizationRequest(
    [property: Required(ErrorMessage = "Введите название"),
               MaxLength(200, ErrorMessage = "Название не должно превышать 200 символов")]
    string Name,
    [property: Required(ErrorMessage = "Введите город"),
               MaxLength(100, ErrorMessage = "Название города не должно превышать 100 символов")]
    string City,
    [property: Required(ErrorMessage = "Введите адрес"),
               MaxLength(500, ErrorMessage = "Адрес не должен превышать 500 символов")]
    string Address,
    [property: MaxLength(1000, ErrorMessage = "Описание не должно превышать 1000 символов")]
    string? Description,
    [property: EmailAddress(ErrorMessage = "Некорректный формат email"),
               MaxLength(256, ErrorMessage = "Email не должен превышать 256 символов")]
    string? Email,
    [property: Phone(ErrorMessage = "Некорректный формат телефона"),
               MaxLength(20, ErrorMessage = "Телефон не должен превышать 20 символов")]
    string? Phone,
    [property: Url(ErrorMessage = "Некорректный формат URL"),
               MaxLength(500, ErrorMessage = "URL не должен превышать 500 символов")]
    string? Website
);
