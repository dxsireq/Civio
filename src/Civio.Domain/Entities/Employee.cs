namespace Civio.Domain.Entities;

public sealed class Employee
{
    public Guid Id { get; set; }

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;

    public Guid? BranchId { get; set; }
    public Branch? Branch { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }

    public string? Position { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }

    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    public ICollection<EmployeeService> EmployeeServices { get; set; } = [];
    public ICollection<ScheduleTemplate> ScheduleTemplates { get; set; } = [];
    public ICollection<WorkDay> WorkDays { get; set; } = [];
    public ICollection<BookingSlot> BookingSlots { get; set; } = [];
    public ICollection<Booking> Bookings { get; set; } = [];
}
