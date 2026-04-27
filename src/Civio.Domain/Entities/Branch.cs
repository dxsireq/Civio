namespace Civio.Domain.Entities;

public sealed class Branch
{
    public Guid Id { get; set; }

    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Phone { get; set; }

    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    public ICollection<Employee> Employees { get; set; } = [];
    public ICollection<Booking> Bookings { get; set; } = [];
}
