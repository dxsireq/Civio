using System.Security.Claims;
using Civio.Application.Organizations;
using Civio.Contracts.Organizations;
using Microsoft.AspNetCore.Mvc;

namespace Civio.Api.Endpoints;

public static class OrganizationEndpoints
{
    public static IEndpointRouteBuilder MapOrganizationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/organizations")
            .WithTags("Organizations")
            .RequireAuthorization();

        group.MapPost("/", CreateOrganizationAsync);

        return app;
    }

    private static async Task<IResult> CreateOrganizationAsync(
        ClaimsPrincipal user,
        [FromBody] CreateOrganizationRequest request,
        IOrganizationService organizationService,
        CancellationToken cancellationToken)
    {
        var userIdValue = user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var ownerUserId))
            return Results.Unauthorized();

        try
        {
            var response = await organizationService.CreateAsync(
                ownerUserId,
                request,
                cancellationToken);

            return Results.Created($"/api/organizations/{response.Id}", response);
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(new
            {
                error = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return Results.Problem(
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
