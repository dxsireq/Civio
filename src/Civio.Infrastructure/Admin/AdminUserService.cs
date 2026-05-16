using Civio.Application.Admin;
using Civio.Contracts.Admin;
using Civio.Domain.Entities;
using Civio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Civio.Infrastructure.Admin;

public sealed class AdminUserService : IAdminUserService
{
    private readonly AppDbContext _dbContext;

    public AdminUserService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<UserListItemDto>> GetAllUsersAsync(
        string? search,
        string? role,
        bool? isActive,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Users
            .AsNoTracking()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var like = $"%{search.Trim()}%";
            query = query.Where(u =>
                EF.Functions.ILike(u.Email, like) ||
                EF.Functions.ILike(u.FirstName, like) ||
                EF.Functions.ILike(u.LastName, like) ||
                (u.Phone != null && EF.Functions.ILike(u.Phone, like)));
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role.Name == role));
        }

        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync(cancellationToken);

        return users
            .Select(u => new UserListItemDto(
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                u.Phone,
                u.IsActive,
                u.UserRoles.Select(ur => ur.Role.Name).OrderBy(n => n).ToArray(),
                u.CreatedAt))
            .ToArray();
    }

    public async Task<UserDetailDto> GetUserByIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await LoadUserAsync(userId, asNoTracking: true, cancellationToken);
        return await ToDetailAsync(user, cancellationToken);
    }

    public async Task<UserDetailDto> UpdateUserRolesAsync(
        Guid userId,
        Guid actorId,
        UpdateUserRolesRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Roles is null)
            throw new ArgumentException("Roles must not be null.");

        var requestedRoles = request.Roles
            .Where(r => !string.IsNullOrWhiteSpace(r))
            .Select(r => r.Trim())
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        var user = await LoadUserAsync(userId, asNoTracking: false, cancellationToken);

        if (userId == actorId)
        {
            var stillAdmin = requestedRoles.Contains("PlatformAdmin", StringComparer.Ordinal);
            if (!stillAdmin)
                throw new InvalidOperationException("Cannot remove PlatformAdmin role from yourself.");
        }

        var allRoles = await _dbContext.Roles
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var unknown = requestedRoles
            .Where(r => !allRoles.Any(ar => ar.Name == r))
            .ToArray();

        if (unknown.Length > 0)
            throw new InvalidOperationException($"Unknown roles: {string.Join(", ", unknown)}.");

        var targetRoleIds = allRoles
            .Where(r => requestedRoles.Contains(r.Name, StringComparer.Ordinal))
            .Select(r => r.Id)
            .ToHashSet();

        var currentRoleIds = user.UserRoles.Select(ur => ur.RoleId).ToHashSet();

        var toRemove = user.UserRoles
            .Where(ur => !targetRoleIds.Contains(ur.RoleId))
            .ToList();

        foreach (var ur in toRemove)
            _dbContext.UserRoles.Remove(ur);

        foreach (var roleId in targetRoleIds.Where(id => !currentRoleIds.Contains(id)))
        {
            _dbContext.UserRoles.Add(new UserRole { UserId = userId, RoleId = roleId });
        }

        user.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        var refreshed = await LoadUserAsync(userId, asNoTracking: true, cancellationToken);
        return await ToDetailAsync(refreshed, cancellationToken);
    }

    public async Task<UserDetailDto> BlockUserAsync(
        Guid userId,
        Guid actorId,
        CancellationToken cancellationToken = default)
    {
        if (userId == actorId)
            throw new InvalidOperationException("Cannot block yourself.");

        var user = await LoadUserAsync(userId, asNoTracking: false, cancellationToken);
        user.IsActive = false;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        var refreshed = await LoadUserAsync(userId, asNoTracking: true, cancellationToken);
        return await ToDetailAsync(refreshed, cancellationToken);
    }

    public async Task<UserDetailDto> UnblockUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await LoadUserAsync(userId, asNoTracking: false, cancellationToken);
        user.IsActive = true;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        var refreshed = await LoadUserAsync(userId, asNoTracking: true, cancellationToken);
        return await ToDetailAsync(refreshed, cancellationToken);
    }

    private async Task<User> LoadUserAsync(Guid userId, bool asNoTracking, CancellationToken ct)
    {
        var query = _dbContext.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (asNoTracking)
            query = query.AsNoTracking();

        var user = await query.FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user is null)
            throw new KeyNotFoundException($"User {userId} not found.");

        return user;
    }

    private async Task<UserDetailDto> ToDetailAsync(User user, CancellationToken ct)
    {
        var ownedOrgs = await _dbContext.Organizations
            .AsNoTracking()
            .Include(o => o.Status)
            .Where(o => o.OwnerUserId == user.Id)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new UserOwnedOrganizationDto(o.Id, o.Name, o.Status.Code))
            .ToListAsync(ct);

        return new UserDetailDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.MiddleName,
            user.Phone,
            user.IsActive,
            user.UserRoles.Select(ur => ur.Role.Name).OrderBy(n => n).ToArray(),
            ownedOrgs,
            user.CreatedAt,
            user.UpdatedAt);
    }
}
