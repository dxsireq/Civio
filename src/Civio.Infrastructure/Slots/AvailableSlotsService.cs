using Civio.Application.Slots;
using Civio.Contracts.Slots;
using Civio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Civio.Infrastructure.Slots;

public sealed class AvailableSlotsService : IAvailableSlotsService
{
    private readonly AppDbContext _dbContext;
    private readonly SlotCalculationService _calculator;

    public AvailableSlotsService(AppDbContext dbContext, SlotCalculationService calculator)
    {
        _dbContext = dbContext;
        _calculator = calculator;
    }

    public async Task<IReadOnlyList<AvailableSlotResponse>> GetAvailableSlotsAsync(
        Guid organizationId,
        Guid serviceId,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var orgExists = await _dbContext.Organizations
            .AsNoTracking()
            .AnyAsync(o => o.Id == organizationId, cancellationToken);

        if (!orgExists)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        var service = await _dbContext.Services
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.OrganizationId == organizationId && s.IsActive, cancellationToken);

        if (service is null)
            throw new KeyNotFoundException($"Service {serviceId} not found.");

        var employees = await _dbContext.Employees
            .AsNoTracking()
            .Where(e => e.OrganizationId == organizationId && e.IsActive)
            .Where(e => e.EmployeeServices.Any(es => es.ServiceId == serviceId))
            .ToListAsync(cancellationToken);

        if (employees.Count == 0)
            return [];

        var employeeIds = employees.Select(e => e.Id).ToList();

        var workDays = await _dbContext.WorkDays
            .AsNoTracking()
            .Where(w => employeeIds.Contains(w.EmployeeId) && w.WorkDate == date && w.IsWorking)
            .ToListAsync(cancellationToken);

        if (workDays.Count == 0)
            return [];

        var dayStart = new DateTimeOffset(date.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
        var dayEnd = dayStart.AddDays(1);

        var existingSlots = await _dbContext.BookingSlots
            .AsNoTracking()
            .Where(s => employeeIds.Contains(s.EmployeeId) && s.StartAt >= dayStart && s.StartAt < dayEnd)
            .ToListAsync(cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var employeeMap = employees.ToDictionary(e => e.Id);
        var result = new List<AvailableSlotResponse>();

        foreach (var workDay in workDays)
        {
            var employeeSlots = existingSlots.Where(s => s.EmployeeId == workDay.EmployeeId).ToList();
            var freeSlots = _calculator.GetAvailableSlots(workDay, employeeSlots, service.DurationMinutes);

            var employee = employeeMap[workDay.EmployeeId];

            foreach (var slot in freeSlots)
            {
                var startAt = new DateTimeOffset(date.ToDateTime(slot.Start), TimeSpan.Zero);
                if (startAt <= now)
                    continue;

                var endAt = new DateTimeOffset(date.ToDateTime(slot.End), TimeSpan.Zero);

                result.Add(new AvailableSlotResponse(
                    employee.Id,
                    employee.FirstName,
                    employee.LastName,
                    startAt,
                    endAt));
            }
        }

        return result.OrderBy(s => s.StartAt).ThenBy(s => s.EmployeeLastName).ToList();
    }
}
