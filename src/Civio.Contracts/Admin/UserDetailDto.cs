namespace Civio.Contracts.Admin;

public record UserDetailDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? MiddleName,
    string? Phone,
    bool IsActive,
    IReadOnlyList<string> Roles,
    IReadOnlyList<UserOwnedOrganizationDto> OwnedOrganizations,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt);

public record UserOwnedOrganizationDto(
    Guid Id,
    string Name,
    string Status);
