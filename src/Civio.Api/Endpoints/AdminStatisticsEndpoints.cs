using System.Security.Claims;
using Civio.Application.Statistics;

namespace Civio.Api.Endpoints;

public static class AdminStatisticsEndpoints
{
    public static IEndpointRouteBuilder MapAdminStatisticsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/admin")
            .WithTags("Admin")
            .RequireAuthorization("PlatformAdmin");

        group.MapGet("/statistics", GetPlatformStatisticsAsync);
        group.MapGet("/organizations/{orgId:guid}/statistics", GetOrgStatisticsAsAdminAsync);

        return app;
    }

    private static async Task<IResult> GetPlatformStatisticsAsync(
        DateTimeOffset from,
        DateTimeOffset to,
        IPlatformStatisticsService platformStatisticsService,
        CancellationToken cancellationToken)
    {
        var response = await platformStatisticsService.GetAsync(from, to, cancellationToken);
        return Results.Ok(response);
    }

    private static async Task<IResult> GetOrgStatisticsAsAdminAsync(
        Guid orgId,
        DateTimeOffset from,
        DateTimeOffset to,
        ClaimsPrincipal user,
        IOrganizationStatisticsService organizationStatisticsService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var response = await organizationStatisticsService.GetAsync(
            orgId, userId, from, to, cancellationToken, bypassOwnerCheck: true);
        return Results.Ok(response);
    }

    private static bool TryGetUserId(ClaimsPrincipal user, out Guid userId) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
}
