namespace Civio.Contracts.Admin;

public record UserListItemDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? Phone,
    bool IsActive,
    IReadOnlyList<string> Roles,
    DateTimeOffset CreatedAt);
