using System.Security.Claims;
using Civio.Application.Employees;
using Civio.Contracts.Invitations;
using Microsoft.AspNetCore.Mvc;

namespace Civio.Api.Endpoints;

public static class InvitationEndpoints
{
    public static IEndpointRouteBuilder MapInvitationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/invitations")
            .WithTags("Invitations");

        // Public: get invitation info for pre-filling registration form
        group.MapGet("/{token}", GetByTokenAsync);

        // Public: register a new user and accept invitation in one step
        group.MapPost("/{token}/accept-register", AcceptWithRegistrationAsync);

        // Authenticated: existing user accepts invitation
        group.MapPost("/{token}/accept", AcceptAsync)
            .RequireAuthorization();

        return app;
    }

    private static async Task<IResult> GetByTokenAsync(
        string token,
        IEmployeeInvitationService invitationService,
        CancellationToken cancellationToken)
    {
        var response = await invitationService.GetByTokenAsync(token, cancellationToken);
        return Results.Ok(response);
    }

    private static async Task<IResult> AcceptWithRegistrationAsync(
        string token,
        [FromBody] AcceptInvitationRegisterRequest request,
        IEmployeeInvitationService invitationService,
        CancellationToken cancellationToken)
    {
        var response = await invitationService.AcceptWithRegistrationAsync(token, request, cancellationToken);
        return Results.Ok(response);
    }

    private static async Task<IResult> AcceptAsync(
        string token,
        ClaimsPrincipal user,
        IEmployeeInvitationService invitationService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        await invitationService.AcceptAsync(token, userId, cancellationToken);
        return Results.NoContent();
    }

    private static bool TryGetUserId(ClaimsPrincipal user, out Guid userId) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
}
