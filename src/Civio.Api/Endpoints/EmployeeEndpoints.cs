using System.Security.Claims;
using Civio.Application.Employees;
using Civio.Contracts.Employees;
using Microsoft.AspNetCore.Mvc;

namespace Civio.Api.Endpoints;

public static class EmployeeEndpoints
{
    public static IEndpointRouteBuilder MapEmployeeEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/organizations/{orgId:guid}/employees")
            .WithTags("Employees")
            .RequireAuthorization();

        group.MapPost("/", CreateEmployeeAsync);
        group.MapGet("/", GetEmployeesAsync);
        group.MapGet("/{id:guid}", GetEmployeeByIdAsync);
        group.MapPut("/{id:guid}", UpdateEmployeeAsync);
        group.MapDelete("/{id:guid}", DeactivateEmployeeAsync);

        return app;
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

    private static bool TryGetUserId(ClaimsPrincipal user, out Guid userId) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
}
