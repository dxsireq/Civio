namespace Civio.Contracts.Admin;

public record UpdateUserRolesRequest(IReadOnlyList<string> Roles);
