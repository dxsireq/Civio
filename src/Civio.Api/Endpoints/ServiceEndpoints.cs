using System.Security.Claims;
using Civio.Application.Services;
using Civio.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace Civio.Api.Endpoints;

public static class ServiceEndpoints
{
    public static IEndpointRouteBuilder MapServiceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/organizations/{orgId:guid}/services")
            .WithTags("Services");

        group.MapGet("/", GetServicesAsync);

        group.MapPost("/", CreateServiceAsync).RequireAuthorization();
        group.MapPut("/{serviceId:guid}", UpdateServiceAsync).RequireAuthorization();
        group.MapDelete("/{serviceId:guid}", DeactivateServiceAsync).RequireAuthorization();

        return app;
    }

    private static async Task<IResult> GetServicesAsync(
        Guid orgId,
        IServiceService serviceService,
        CancellationToken cancellationToken)
    {
        var services = await serviceService.GetByOrganizationAsync(orgId, cancellationToken);
        return Results.Ok(services);
    }

    private static async Task<IResult> CreateServiceAsync(
        Guid orgId,
        ClaimsPrincipal user,
        [FromBody] CreateServiceRequest request,
        IServiceService serviceService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var response = await serviceService.CreateAsync(orgId, userId, request, cancellationToken);
        return Results.Created($"/api/organizations/{orgId}/services/{response.Id}", response);
    }

    private static async Task<IResult> UpdateServiceAsync(
        Guid orgId,
        Guid serviceId,
        ClaimsPrincipal user,
        [FromBody] UpdateServiceRequest request,
        IServiceService serviceService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var response = await serviceService.UpdateAsync(serviceId, orgId, userId, request, cancellationToken);
        return Results.Ok(response);
    }

    private static async Task<IResult> DeactivateServiceAsync(
        Guid orgId,
        Guid serviceId,
        ClaimsPrincipal user,
        IServiceService serviceService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        await serviceService.DeactivateAsync(serviceId, orgId, userId, cancellationToken);
        return Results.NoContent();
    }

    private static bool TryGetUserId(ClaimsPrincipal user, out Guid userId) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
}
