using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Invitations;

public sealed record AcceptInvitationRegisterRequest(
    [property: MinLength(8), MaxLength(100)] string Password,
    string? FirstName,
    string? LastName,
    string? MiddleName,
    string? Phone
);
