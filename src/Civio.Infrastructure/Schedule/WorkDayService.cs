using Civio.Application.Schedule;
using Civio.Contracts.WorkDays;
using Civio.Domain.Authorization;
using Civio.Domain.Entities;
using Civio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Civio.Infrastructure.Schedule;

public sealed class WorkDayService : IWorkDayService
{
    private readonly AppDbContext _dbContext;

    public WorkDayService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<WorkDayResponse> CreateAsync(
        Guid employeeId,
        Guid requestingUserId,
        CreateWorkDayRequest request,
        CancellationToken cancellationToken = default)
    {
        var employee = await _dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == employeeId && e.IsActive, cancellationToken);

        if (employee is null)
            throw new KeyNotFoundException($"Employee {employeeId} not found.");

        await RequireOwnerOrSelfAsync(employee, requestingUserId, cancellationToken);

        ValidateTimes(request.StartTime, request.EndTime, request.BreakStart, request.BreakEnd);

        var duplicate = await _dbContext.WorkDays
            .AsNoTracking()
            .AnyAsync(w => w.EmployeeId == employeeId && w.WorkDate == request.WorkDate, cancellationToken);

        if (duplicate)
            throw new InvalidOperationException($"Work day for {request.WorkDate} already exists.");

        var workDay = new WorkDay
        {
            Id = Guid.NewGuid(),
            EmployeeId = employeeId,
            WorkDate = request.WorkDate,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            BreakStart = request.BreakStart,
            BreakEnd = request.BreakEnd,
            IsWorking = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.WorkDays.Add(workDay);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(workDay);
    }

    public async Task<IReadOnlyList<WorkDayResponse>> GetByEmployeeAsync(
        Guid employeeId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var employee = await _dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == employeeId && e.IsActive, cancellationToken);

        if (employee is null)
            throw new KeyNotFoundException($"Employee {employeeId} not found.");

        await RequireOwnerOrSelfAsync(employee, requestingUserId, cancellationToken);

        return await _dbContext.WorkDays
            .AsNoTracking()
            .Where(w => w.EmployeeId == employeeId)
            .OrderBy(w => w.WorkDate)
            .Select(w => ToResponse(w))
            .ToListAsync(cancellationToken);
    }

    public async Task<WorkDayResponse> UpdateAsync(
        Guid workDayId,
        Guid employeeId,
        Guid requestingUserId,
        UpdateWorkDayRequest request,
        CancellationToken cancellationToken = default)
    {
        var employee = await _dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == employeeId && e.IsActive, cancellationToken);

        if (employee is null)
            throw new KeyNotFoundException($"Employee {employeeId} not found.");

        await RequireOwnerOrSelfAsync(employee, requestingUserId, cancellationToken);

        ValidateTimes(request.StartTime, request.EndTime, request.BreakStart, request.BreakEnd);

        var workDay = await _dbContext.WorkDays
            .FirstOrDefaultAsync(w => w.Id == workDayId && w.EmployeeId == employeeId, cancellationToken);

        if (workDay is null)
            throw new KeyNotFoundException($"Work day {workDayId} not found.");

        workDay.StartTime = request.StartTime;
        workDay.EndTime = request.EndTime;
        workDay.BreakStart = request.BreakStart;
        workDay.BreakEnd = request.BreakEnd;
        workDay.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(workDay);
    }

    public async Task DeleteAsync(
        Guid workDayId,
        Guid employeeId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var employee = await _dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == employeeId && e.IsActive, cancellationToken);

        if (employee is null)
            throw new KeyNotFoundException($"Employee {employeeId} not found.");

        await RequireOwnerOrSelfAsync(employee, requestingUserId, cancellationToken);

        var workDay = await _dbContext.WorkDays
            .FirstOrDefaultAsync(w => w.Id == workDayId && w.EmployeeId == employeeId, cancellationToken);

        if (workDay is null)
            throw new KeyNotFoundException($"Work day {workDayId} not found.");

        _dbContext.WorkDays.Remove(workDay);
        await _dbContext.SaveChangesAsync(cancellationToken);
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

    private static void ValidateTimes(
        TimeOnly start,
        TimeOnly end,
        TimeOnly? breakStart,
        TimeOnly? breakEnd)
    {
        if (start >= end)
            throw new ArgumentException("Start time must be before end time.");

        if (breakStart.HasValue && breakEnd.HasValue && breakStart >= breakEnd)
            throw new ArgumentException("Break start must be before break end.");

        if (breakStart.HasValue != breakEnd.HasValue)
            throw new ArgumentException("Both break_start and break_end must be provided together.");
    }

    private static WorkDayResponse ToResponse(WorkDay w) =>
        new(
            w.Id,
            w.EmployeeId,
            w.WorkDate,
            w.StartTime,
            w.EndTime,
            w.BreakStart,
            w.BreakEnd,
            w.IsWorking,
            w.CreatedAt.UtcDateTime);
}
