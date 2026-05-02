using System.Security.Claims;
using Civio.Application.Bookings;
using Civio.Contracts.Bookings;
using Microsoft.AspNetCore.Mvc;

namespace Civio.Api.Endpoints;

public static class BookingEndpoints
{
    public static IEndpointRouteBuilder MapBookingEndpoints(this IEndpointRouteBuilder app)
    {
        var bookings = app
            .MapGroup("/api/bookings")
            .WithTags("Bookings")
            .RequireAuthorization();

        bookings.MapPost("/", CreateBookingAsync);
        bookings.MapGet("/my", GetMyBookingsAsync);
        bookings.MapGet("/{id:guid}", GetBookingByIdAsync);
        bookings.MapPost("/{id:guid}/cancel", CancelBookingAsync);
        bookings.MapPost("/{id:guid}/confirm", ConfirmBookingAsync);
        bookings.MapPost("/{id:guid}/reject", RejectBookingAsync);
        bookings.MapPost("/{id:guid}/complete", CompleteBookingAsync);

        app.MapGroup("/api/organizations")
            .WithTags("Bookings")
            .RequireAuthorization()
            .MapGet("/{orgId:guid}/bookings", GetOrgBookingsAsync);

        return app;
    }

    private static async Task<IResult> CreateBookingAsync(
        ClaimsPrincipal user,
        [FromBody] CreateBookingRequest request,
        IBookingService bookingService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var response = await bookingService.CreateAsync(userId, request, cancellationToken);
        return Results.Created($"/api/bookings/{response.Id}", response);
    }

    private static async Task<IResult> GetMyBookingsAsync(
        ClaimsPrincipal user,
        IBookingService bookingService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var bookings = await bookingService.GetMyBookingsAsync(userId, cancellationToken);
        return Results.Ok(bookings);
    }

    private static async Task<IResult> GetBookingByIdAsync(
        Guid id,
        ClaimsPrincipal user,
        IBookingService bookingService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var booking = await bookingService.GetByIdAsync(id, userId, cancellationToken);
        return Results.Ok(booking);
    }

    private static async Task<IResult> CancelBookingAsync(
        Guid id,
        ClaimsPrincipal user,
        IBookingService bookingService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var booking = await bookingService.CancelAsync(id, userId, cancellationToken);
        return Results.Ok(booking);
    }

    private static async Task<IResult> ConfirmBookingAsync(
        Guid id,
        ClaimsPrincipal user,
        IBookingService bookingService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var booking = await bookingService.ConfirmAsync(id, userId, cancellationToken);
        return Results.Ok(booking);
    }

    private static async Task<IResult> RejectBookingAsync(
        Guid id,
        ClaimsPrincipal user,
        IBookingService bookingService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var booking = await bookingService.RejectAsync(id, userId, cancellationToken);
        return Results.Ok(booking);
    }

    private static async Task<IResult> CompleteBookingAsync(
        Guid id,
        ClaimsPrincipal user,
        IBookingService bookingService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var booking = await bookingService.CompleteAsync(id, userId, cancellationToken);
        return Results.Ok(booking);
    }

    private static async Task<IResult> GetOrgBookingsAsync(
        Guid orgId,
        ClaimsPrincipal user,
        IBookingService bookingService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var bookings = await bookingService.GetByOrganizationAsync(orgId, userId, cancellationToken);
        return Results.Ok(bookings);
    }

    private static bool TryGetUserId(ClaimsPrincipal user, out Guid userId) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
}
