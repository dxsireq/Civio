namespace Civio.Contracts.Auth;

public sealed record CurrentUserResponse(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    string? MiddleName,
    string? Phone,
    IReadOnlyCollection<string> Roles);
