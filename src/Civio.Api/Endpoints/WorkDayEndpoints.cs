using System.Security.Claims;
using Civio.Application.Schedule;
using Civio.Contracts.WorkDays;
using Microsoft.AspNetCore.Mvc;

namespace Civio.Api.Endpoints;

public static class WorkDayEndpoints
{
    public static IEndpointRouteBuilder MapWorkDayEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/employees/{employeeId:guid}/work-days")
            .WithTags("Schedule")
            .RequireAuthorization();

        group.MapPost("/", CreateWorkDayAsync);
        group.MapGet("/", GetWorkDaysAsync);
        group.MapPut("/{workDayId:guid}", UpdateWorkDayAsync);
        group.MapDelete("/{workDayId:guid}", DeleteWorkDayAsync);

        return app;
    }

    private static async Task<IResult> CreateWorkDayAsync(
        Guid employeeId,
        ClaimsPrincipal user,
        [FromBody] CreateWorkDayRequest request,
        IWorkDayService workDayService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var response = await workDayService.CreateAsync(employeeId, userId, request, cancellationToken);
        return Results.Created($"/api/employees/{employeeId}/work-days/{response.Id}", response);
    }

    private static async Task<IResult> GetWorkDaysAsync(
        Guid employeeId,
        ClaimsPrincipal user,
        IWorkDayService workDayService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var workDays = await workDayService.GetByEmployeeAsync(employeeId, userId, cancellationToken);
        return Results.Ok(workDays);
    }

    private static async Task<IResult> UpdateWorkDayAsync(
        Guid employeeId,
        Guid workDayId,
        ClaimsPrincipal user,
        [FromBody] UpdateWorkDayRequest request,
        IWorkDayService workDayService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var response = await workDayService.UpdateAsync(workDayId, employeeId, userId, request, cancellationToken);
        return Results.Ok(response);
    }

    private static async Task<IResult> DeleteWorkDayAsync(
        Guid employeeId,
        Guid workDayId,
        ClaimsPrincipal user,
        IWorkDayService workDayService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        await workDayService.DeleteAsync(workDayId, employeeId, userId, cancellationToken);
        return Results.NoContent();
    }

    private static bool TryGetUserId(ClaimsPrincipal user, out Guid userId) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
}
