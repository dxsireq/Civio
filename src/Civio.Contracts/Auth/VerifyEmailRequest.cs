using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Auth;

public sealed record VerifyEmailRequest(
    [property: Required(ErrorMessage = "Введите email"),
               EmailAddress(ErrorMessage = "Некорректный формат email")]
    string Email,
    [property: Required(ErrorMessage = "Введите код подтверждения"),
               RegularExpression(@"^\d{6}$", ErrorMessage = "Код должен состоять из 6 цифр")]
    string Code);
