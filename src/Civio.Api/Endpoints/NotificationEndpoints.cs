using System.Security.Claims;
using Civio.Application.Notifications;

namespace Civio.Api.Endpoints;

public static class NotificationEndpoints
{
    public static IEndpointRouteBuilder MapNotificationEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGroup("/api/notifications")
            .WithTags("Notifications")
            .RequireAuthorization()
            .MapGet("/my", GetMyAsync);

        return app;
    }

    private static async Task<IResult> GetMyAsync(
        ClaimsPrincipal user,
        INotificationService notificationService,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Results.Unauthorized();

        var notifications = await notificationService.GetMyAsync(userId, cancellationToken);
        return Results.Ok(notifications);
    }
}
