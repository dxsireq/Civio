namespace Civio.Contracts.WorkDays;

public sealed record CreateWorkDayRequest(
    DateOnly WorkDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    TimeOnly? BreakStart,
    TimeOnly? BreakEnd
);
