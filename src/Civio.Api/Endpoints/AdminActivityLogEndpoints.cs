using Civio.Application.Admin;
using Microsoft.AspNetCore.Mvc;

namespace Civio.Api.Endpoints;

public static class AdminActivityLogEndpoints
{
    public static IEndpointRouteBuilder MapAdminActivityLogEndpoints(this IEndpointRouteBuilder app)
    {
        app
            .MapGet("/api/admin/activity-log", GetActivityLogAsync)
            .WithTags("Admin")
            .RequireAuthorization("PlatformAdmin");

        return app;
    }

    private static async Task<IResult> GetActivityLogAsync(
        IActivityLogService service,
        CancellationToken cancellationToken,
        [FromQuery] string? entityType = null,
        [FromQuery] Guid? actorId = null,
        [FromQuery] DateTimeOffset? from = null,
        [FromQuery] DateTimeOffset? to = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var result = await service.GetActivityLogAsync(
            entityType,
            actorId,
            from,
            to,
            page,
            pageSize,
            cancellationToken);

        return Results.Ok(result);
    }
}
