using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Invitations;

public sealed record AcceptInvitationRegisterRequest(
    [MinLength(8)] string Password,
    string? FirstName,
    string? LastName,
    string? MiddleName,
    string? Phone
);
