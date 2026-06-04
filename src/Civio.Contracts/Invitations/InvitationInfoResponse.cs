namespace Civio.Contracts.Invitations;

public sealed record InvitationInfoResponse(
    string Email,
    string FirstName,
    string LastName,
    string? MiddleName,
    string? Phone,
    string? Position,
    string OrganizationName,
    bool UserExists,
    /// <summary>pending | accepted | expired | revoked</summary>
    string Status,
    DateTimeOffset ExpiresAt
);
