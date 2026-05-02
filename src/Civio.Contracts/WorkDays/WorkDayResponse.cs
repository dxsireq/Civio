namespace Civio.Contracts.WorkDays;

public sealed record WorkDayResponse(
    Guid Id,
    Guid EmployeeId,
    DateOnly WorkDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    TimeOnly? BreakStart,
    TimeOnly? BreakEnd,
    bool IsWorking,
    DateTime CreatedAt
);
