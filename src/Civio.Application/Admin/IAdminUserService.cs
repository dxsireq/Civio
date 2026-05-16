using Civio.Contracts.Admin;

namespace Civio.Application.Admin;

public interface IAdminUserService
{
    Task<IReadOnlyList<UserListItemDto>> GetAllUsersAsync(
        string? search,
        string? role,
        bool? isActive,
        CancellationToken cancellationToken = default);

    Task<UserDetailDto> GetUserByIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<UserDetailDto> UpdateUserRolesAsync(
        Guid userId,
        Guid actorId,
        UpdateUserRolesRequest request,
        CancellationToken cancellationToken = default);

    Task<UserDetailDto> BlockUserAsync(
        Guid userId,
        Guid actorId,
        CancellationToken cancellationToken = default);

    Task<UserDetailDto> UnblockUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}
