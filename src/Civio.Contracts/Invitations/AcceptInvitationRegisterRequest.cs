using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Invitations;

public sealed record AcceptInvitationRegisterRequest(
    [property: MinLength(8, ErrorMessage = "Пароль должен содержать минимум 8 символов"),
               MaxLength(100, ErrorMessage = "Пароль не должен превышать 100 символов")]
    string Password,
    string? FirstName,
    string? LastName,
    string? MiddleName,
    string? Phone
);
