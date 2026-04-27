namespace Civio.Domain.Entities;

public sealed class ScheduleTemplate
{
    public Guid Id { get; set; }

    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public short DayOfWeek { get; set; }

    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public TimeOnly? BreakStart { get; set; }
    public TimeOnly? BreakEnd { get; set; }

    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
