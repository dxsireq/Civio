namespace Civio.Contracts.ScheduleTemplates;

public sealed record ScheduleTemplateResponse(
    Guid Id,
    Guid EmployeeId,
    short DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime,
    TimeOnly? BreakStart,
    TimeOnly? BreakEnd,
    bool IsActive,
    DateTime CreatedAt
);
