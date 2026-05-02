using Civio.Application.Slots;

namespace Civio.Api.Endpoints;

public static class SlotsEndpoints
{
    public static IEndpointRouteBuilder MapSlotsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGroup("/api/organizations")
            .WithTags("Slots")
            .MapGet("/{orgId:guid}/available-slots", GetAvailableSlotsAsync);

        return app;
    }

    private static async Task<IResult> GetAvailableSlotsAsync(
        Guid orgId,
        Guid serviceId,
        DateOnly date,
        IAvailableSlotsService slotsService,
        CancellationToken cancellationToken)
    {
        var slots = await slotsService.GetAvailableSlotsAsync(orgId, serviceId, date, cancellationToken);
        return Results.Ok(slots);
    }
}
