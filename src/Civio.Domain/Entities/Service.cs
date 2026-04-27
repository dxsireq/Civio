namespace Civio.Domain.Entities;

public sealed class Service
{
    public Guid Id { get; set; }

    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;

    public Guid? CategoryId { get; set; }
    public ServiceCategory? Category { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public int DurationMinutes { get; set; }
    public decimal? Price { get; set; }

    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    public ICollection<EmployeeService> EmployeeServices { get; set; } = [];
    public ICollection<BookingSlot> BookingSlots { get; set; } = [];
    public ICollection<Booking> Bookings { get; set; } = [];
}
