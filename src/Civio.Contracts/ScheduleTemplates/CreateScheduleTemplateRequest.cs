namespace Civio.Contracts.ScheduleTemplates;

public sealed record CreateScheduleTemplateRequest(
    short DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime,
    TimeOnly? BreakStart,
    TimeOnly? BreakEnd
);
