namespace Civio.Domain.Entities;

public sealed class BookingStatusHistory
{
    public Guid Id { get; set; }

    public Guid BookingId { get; set; }
    public Booking Booking { get; set; } = null!;

    public Guid? OldStatusId { get; set; }
    public BookingStatus? OldStatus { get; set; }

    public Guid NewStatusId { get; set; }
    public BookingStatus NewStatus { get; set; } = null!;

    public Guid? ChangedById { get; set; }
    public User? ChangedBy { get; set; }

    public string? Comment { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
