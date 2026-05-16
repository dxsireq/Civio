using System.Security.Claims;
using Civio.Application.Admin;
using Civio.Contracts.Admin;
using Microsoft.AspNetCore.Mvc;

namespace Civio.Api.Endpoints;

public static class AdminUserEndpoints
{
    public static IEndpointRouteBuilder MapAdminUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/admin/users")
            .WithTags("Admin")
            .RequireAuthorization("PlatformAdmin");

        group.MapGet("/", GetAllAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPut("/{id:guid}/roles", UpdateRolesAsync);
        group.MapPost("/{id:guid}/block", BlockAsync);
        group.MapPost("/{id:guid}/unblock", UnblockAsync);

        return app;
    }

    private static async Task<IResult> GetAllAsync(
        IAdminUserService service,
        CancellationToken cancellationToken,
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] bool? isActive = null)
    {
        var users = await service.GetAllUsersAsync(search, role, isActive, cancellationToken);
        return Results.Ok(users);
    }

    private static async Task<IResult> GetByIdAsync(
        Guid id,
        IAdminUserService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var user = await service.GetUserByIdAsync(id, cancellationToken);
            return Results.Ok(user);
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(new { error = ex.Message });
        }
    }

    private static async Task<IResult> UpdateRolesAsync(
        Guid id,
        ClaimsPrincipal user,
        [FromBody] UpdateUserRolesRequest request,
        IAdminUserService service,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var actorId))
            return Results.Unauthorized();

        try
        {
            var updated = await service.UpdateUserRolesAsync(id, actorId, request, cancellationToken);
            return Results.Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    private static async Task<IResult> BlockAsync(
        Guid id,
        ClaimsPrincipal user,
        IAdminUserService service,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var actorId))
            return Results.Unauthorized();

        try
        {
            var updated = await service.BlockUserAsync(id, actorId, cancellationToken);
            return Results.Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    private static async Task<IResult> UnblockAsync(
        Guid id,
        IAdminUserService service,
        CancellationToken cancellationToken)
    {
        try
        {
            var updated = await service.UnblockUserAsync(id, cancellationToken);
            return Results.Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(new { error = ex.Message });
        }
    }

    private static bool TryGetUserId(ClaimsPrincipal user, out Guid userId) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
}
