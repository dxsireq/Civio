using System.Security.Claims;
using Civio.Application.Admin;
using Civio.Contracts.Admin;
using Microsoft.AspNetCore.Mvc;

namespace Civio.Api.Endpoints;

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/admin/organizations")
            .WithTags("Admin")
            .RequireAuthorization("PlatformAdmin");

        group.MapGet("/", GetAllOrganizationsAsync);
        group.MapPost("/{id:guid}/approve", ApproveAsync);
        group.MapPost("/{id:guid}/reject", RejectAsync);
        group.MapPost("/{id:guid}/block", BlockAsync);

        return app;
    }

    private static async Task<IResult> GetAllOrganizationsAsync(
        IAdminService adminService,
        CancellationToken cancellationToken)
    {
        var organizations = await adminService.GetAllOrganizationsAsync(cancellationToken);
        return Results.Ok(organizations);
    }

    private static async Task<IResult> ApproveAsync(
        Guid id,
        ClaimsPrincipal user,
        [FromBody] ModerationRequest request,
        IAdminService adminService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var moderatorId))
            return Results.Unauthorized();

        var org = await adminService.ApproveOrganizationAsync(id, moderatorId, request, cancellationToken);
        return Results.Ok(org);
    }

    private static async Task<IResult> RejectAsync(
        Guid id,
        ClaimsPrincipal user,
        [FromBody] ModerationRequest request,
        IAdminService adminService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var moderatorId))
            return Results.Unauthorized();

        var org = await adminService.RejectOrganizationAsync(id, moderatorId, request, cancellationToken);
        return Results.Ok(org);
    }

    private static async Task<IResult> BlockAsync(
        Guid id,
        ClaimsPrincipal user,
        [FromBody] ModerationRequest request,
        IAdminService adminService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var moderatorId))
            return Results.Unauthorized();

        var org = await adminService.BlockOrganizationAsync(id, moderatorId, request, cancellationToken);
        return Results.Ok(org);
    }

    private static bool TryGetUserId(ClaimsPrincipal user, out Guid userId) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
}
