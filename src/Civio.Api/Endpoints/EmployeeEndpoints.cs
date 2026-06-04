using System.Security.Claims;
using Civio.Application.Employees;
using Civio.Contracts.Employees;
using Microsoft.AspNetCore.Mvc;

namespace Civio.Api.Endpoints;

public static class EmployeeEndpoints
{
    public static IEndpointRouteBuilder MapEmployeeEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/employees/me", GetMyEmployeesAsync)
            .WithTags("Employees")
            .RequireAuthorization();

        var group = app
            .MapGroup("/api/organizations/{orgId:guid}/employees")
            .WithTags("Employees")
            .RequireAuthorization();

        group.MapPost("/", CreateEmployeeAsync);
        group.MapGet("/", GetEmployeesAsync);
        group.MapGet("/{id:guid}", GetEmployeeByIdAsync);
        group.MapPut("/{id:guid}", UpdateEmployeeAsync);
        group.MapDelete("/{id:guid}", DeactivateEmployeeAsync);
        group.MapGet("/{id:guid}/services", GetEmployeeServicesAsync);
        group.MapPost("/{id:guid}/services/{serviceId:guid}", AssignServiceAsync);
        group.MapDelete("/{id:guid}/services/{serviceId:guid}", UnassignServiceAsync);
        group.MapPost("/{id:guid}/invitation/resend", ResendInvitationAsync);
        group.MapPost("/{id:guid}/invitation/revoke", RevokeInvitationAsync);

        return app;
    }

    private static async Task<IResult> GetMyEmployeesAsync(
        ClaimsPrincipal user,
        IEmployeeService employeeService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var records = await employeeService.GetMyAsync(userId, cancellationToken);
        return Results.Ok(records);
    }

    private static async Task<IResult> CreateEmployeeAsync(
        Guid orgId,
        ClaimsPrincipal user,
        [FromBody] CreateEmployeeRequest request,
        IEmployeeService employeeService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var response = await employeeService.CreateAsync(orgId, userId, request, cancellationToken);

        return Results.Created($"/api/organizations/{orgId}/employees/{response.Id}", response);
    }

    private static async Task<IResult> GetEmployeesAsync(
        Guid orgId,
        ClaimsPrincipal user,
        IEmployeeService employeeService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var employees = await employeeService.GetByOrganizationAsync(orgId, userId, cancellationToken);

        return Results.Ok(employees);
    }

    private static async Task<IResult> GetEmployeeByIdAsync(
        Guid orgId,
        Guid id,
        ClaimsPrincipal user,
        IEmployeeService employeeService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var employee = await employeeService.GetByIdAsync(id, orgId, userId, cancellationToken);

        return Results.Ok(employee);
    }

    private static async Task<IResult> UpdateEmployeeAsync(
        Guid orgId,
        Guid id,
        ClaimsPrincipal user,
        [FromBody] UpdateEmployeeRequest request,
        IEmployeeService employeeService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var employee = await employeeService.UpdateAsync(id, orgId, userId, request, cancellationToken);

        return Results.Ok(employee);
    }

    private static async Task<IResult> DeactivateEmployeeAsync(
        Guid orgId,
        Guid id,
        ClaimsPrincipal user,
        IEmployeeService employeeService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        await employeeService.DeactivateAsync(id, orgId, userId, cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> GetEmployeeServicesAsync(
        Guid orgId,
        Guid id,
        ClaimsPrincipal user,
        IEmployeeService employeeService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        var services = await employeeService.GetServicesAsync(id, orgId, userId, cancellationToken);
        return Results.Ok(services);
    }

    private static async Task<IResult> AssignServiceAsync(
        Guid orgId,
        Guid id,
        Guid serviceId,
        ClaimsPrincipal user,
        IEmployeeService employeeService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        await employeeService.AssignServiceAsync(id, orgId, serviceId, userId, cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> UnassignServiceAsync(
        Guid orgId,
        Guid id,
        Guid serviceId,
        ClaimsPrincipal user,
        IEmployeeService employeeService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        await employeeService.UnassignServiceAsync(id, orgId, serviceId, userId, cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> ResendInvitationAsync(
        Guid orgId,
        Guid id,
        ClaimsPrincipal user,
        IEmployeeInvitationService invitationService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        await invitationService.ResendAsync(orgId, id, userId, cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> RevokeInvitationAsync(
        Guid orgId,
        Guid id,
        ClaimsPrincipal user,
        IEmployeeInvitationService invitationService,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(user, out var userId))
            return Results.Unauthorized();

        await invitationService.RevokeAsync(orgId, id, userId, cancellationToken);
        return Results.NoContent();
    }

    private static bool TryGetUserId(ClaimsPrincipal user, out Guid userId) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
}
