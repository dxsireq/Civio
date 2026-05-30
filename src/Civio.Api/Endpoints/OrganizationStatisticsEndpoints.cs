using System.Security.Claims;
using Civio.Application.Statistics;

namespace Civio.Api.Endpoints;

public static class OrganizationStatisticsEndpoints
{
    public static IEndpointRouteBuilder MapOrganizationStatisticsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGroup("/api/organizations")
            .WithTags("Statistics")
            .RequireAuthorization()
            .MapGet("/{orgId:guid}/statistics", GetStatisticsAsync);

        return app;
    }

    private static async Task<IResult> GetStatisticsAsync(
        Guid orgId,
        ClaimsPrincipal user,
        IOrganizationStatisticsService statisticsService,
        DateTimeOffset from,
        DateTimeOffset to,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var response = await statisticsService.GetAsync(orgId, userId, from, to, cancellationToken);
        return Results.Ok(response);
    }

    private static bool TryGetUserId(ClaimsPrincipal user, out Guid userId) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
}
