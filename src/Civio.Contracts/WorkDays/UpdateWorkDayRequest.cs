namespace Civio.Contracts.WorkDays;

public sealed record UpdateWorkDayRequest(
    TimeOnly StartTime,
    TimeOnly EndTime,
    TimeOnly? BreakStart,
    TimeOnly? BreakEnd
);
