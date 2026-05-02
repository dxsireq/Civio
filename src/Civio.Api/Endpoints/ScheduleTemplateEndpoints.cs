using System.Security.Claims;
using Civio.Application.Schedule;
using Civio.Contracts.ScheduleTemplates;
using Microsoft.AspNetCore.Mvc;

namespace Civio.Api.Endpoints;

public static class ScheduleTemplateEndpoints
{
    public static IEndpointRouteBuilder MapScheduleTemplateEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/employees/{employeeId:guid}/schedule-templates")
            .WithTags("Schedule")
            .RequireAuthorization();

        group.MapPost("/", CreateScheduleTemplateAsync);

        return app;
    }

    private static async Task<IResult> CreateScheduleTemplateAsync(
        Guid employeeId,
        ClaimsPrincipal user,
        [FromBody] CreateScheduleTemplateRequest request,
        IScheduleTemplateService scheduleTemplateService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var response = await scheduleTemplateService.CreateAsync(employeeId, userId, request, cancellationToken);
        return Results.Created($"/api/employees/{employeeId}/schedule-templates/{response.Id}", response);
    }

    private static bool TryGetUserId(ClaimsPrincipal user, out Guid userId) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
}
