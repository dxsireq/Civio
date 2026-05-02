using Civio.Application.Schedule;
using Civio.Contracts.ScheduleTemplates;
using Civio.Domain.Authorization;
using Civio.Domain.Entities;
using Civio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Civio.Infrastructure.Schedule;

public sealed class ScheduleTemplateService : IScheduleTemplateService
{
    private readonly AppDbContext _dbContext;

    public ScheduleTemplateService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ScheduleTemplateResponse> CreateAsync(
        Guid employeeId,
        Guid requestingUserId,
        CreateScheduleTemplateRequest request,
        CancellationToken cancellationToken = default)
    {
        var employee = await _dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == employeeId && e.IsActive, cancellationToken);

        if (employee is null)
            throw new KeyNotFoundException($"Employee {employeeId} not found.");

        await RequireOwnerOrSelfAsync(employee, requestingUserId, cancellationToken);

        if (request.DayOfWeek < 1 || request.DayOfWeek > 7)
            throw new ArgumentException("DayOfWeek must be between 1 and 7.");

        if (request.StartTime >= request.EndTime)
            throw new ArgumentException("Start time must be before end time.");

        if (request.BreakStart.HasValue != request.BreakEnd.HasValue)
            throw new ArgumentException("Both break_start and break_end must be provided together.");

        if (request.BreakStart.HasValue && request.BreakEnd.HasValue && request.BreakStart >= request.BreakEnd)
            throw new ArgumentException("Break start must be before break end.");

        var template = new ScheduleTemplate
        {
            Id = Guid.NewGuid(),
            EmployeeId = employeeId,
            DayOfWeek = request.DayOfWeek,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            BreakStart = request.BreakStart,
            BreakEnd = request.BreakEnd,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.ScheduleTemplates.Add(template);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(template);
    }

    private async Task RequireOwnerOrSelfAsync(
        Employee employee,
        Guid requestingUserId,
        CancellationToken cancellationToken)
    {
        var organization = await _dbContext.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == employee.OrganizationId, cancellationToken);

        var isOwner = organization is not null && OrganizationAccess.IsOwner(requestingUserId, organization);
        var isSelf = employee.UserId == requestingUserId;

        if (!isOwner && !isSelf)
            throw new UnauthorizedAccessException("Access denied.");
    }

    private static ScheduleTemplateResponse ToResponse(ScheduleTemplate t) =>
        new(
            t.Id,
            t.EmployeeId,
            t.DayOfWeek,
            t.StartTime,
            t.EndTime,
            t.BreakStart,
            t.BreakEnd,
            t.IsActive,
            t.CreatedAt.UtcDateTime);
}
