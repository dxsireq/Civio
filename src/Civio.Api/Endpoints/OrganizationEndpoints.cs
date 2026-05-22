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
        group.MapGet("/", GetCatalogAsync);
        group.MapGet("/my", GetMyOrganizationsAsync);
        group.MapGet("/{id:guid}", GetOrganizationByIdAsync);
        group.MapPut("/{id:guid}", UpdateOrganizationAsync);

        return app;
    }

    private static async Task<IResult> GetCatalogAsync(
        [FromQuery] string? city,
        IOrganizationService organizationService,
        CancellationToken cancellationToken)
    {
        var organizations = await organizationService.GetCatalogAsync(city, cancellationToken);
        return Results.Ok(organizations);
    }

    private static async Task<IResult> GetMyOrganizationsAsync(
        ClaimsPrincipal user,
        IOrganizationService organizationService,
        CancellationToken cancellationToken)
    {
        var userIdValue = user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var ownerUserId))
            return Results.Unauthorized();

        var organizations = await organizationService.GetMyAsync(ownerUserId, cancellationToken);

        return Results.Ok(organizations);
    }

    private static async Task<IResult> GetOrganizationByIdAsync(
        Guid id,
        ClaimsPrincipal user,
        IOrganizationService organizationService,
        CancellationToken cancellationToken)
    {
        var userIdValue = user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var requestingUserId))
            return Results.Unauthorized();

        var organization = await organizationService.GetByIdAsync(id, requestingUserId, cancellationToken);

        return Results.Ok(organization);
    }

    private static async Task<IResult> UpdateOrganizationAsync(
        Guid id,
        ClaimsPrincipal user,
        [FromBody] UpdateOrganizationRequest request,
        IOrganizationService organizationService,
        CancellationToken cancellationToken)
    {
        var userIdValue = user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var requestingUserId))
            return Results.Unauthorized();

        var organization = await organizationService.UpdateAsync(id, requestingUserId, request, cancellationToken);

        return Results.Ok(organization);
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

        var response = await organizationService.CreateAsync(
            ownerUserId,
            request,
            cancellationToken);

        return Results.Created($"/api/organizations/{response.Id}", response);
    }
}
