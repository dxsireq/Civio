namespace Civio.Domain.Entities;

public sealed class BookingSlot
{
    public Guid Id { get; set; }

    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public Guid? ServiceId { get; set; }
    public Service? Service { get; set; }

    public Guid? WorkDayId { get; set; }
    public WorkDay? WorkDay { get; set; }

    public Guid StatusId { get; set; }
    public SlotStatus Status { get; set; } = null!;

    public DateTimeOffset StartAt { get; set; }
    public DateTimeOffset EndAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<Booking> Bookings { get; set; } = [];
}
