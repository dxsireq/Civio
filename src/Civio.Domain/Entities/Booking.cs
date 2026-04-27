namespace Civio.Domain.Entities;

public sealed class Booking
{
    public Guid Id { get; set; }

    public Guid CitizenId { get; set; }
    public User Citizen { get; set; } = null!;

    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;

    public Guid? BranchId { get; set; }
    public Branch? Branch { get; set; }

    public Guid? EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;

    public Guid? SlotId { get; set; }
    public BookingSlot? Slot { get; set; }

    public Guid StatusId { get; set; }
    public BookingStatus Status { get; set; } = null!;

    public string? Comment { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    public BookingQrCode? QrCode { get; set; }
    public ICollection<BookingStatusHistory> StatusHistory { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
}
