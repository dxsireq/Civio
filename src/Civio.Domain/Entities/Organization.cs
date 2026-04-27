namespace Civio.Domain.Entities;

public sealed class Organization
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? LegalName { get; set; }
    public string? Inn { get; set; }

    public Guid StatusId { get; set; }
    public OrganizationStatus Status { get; set; } = null!;

    public Guid? OwnerUserId { get; set; }
    public User? OwnerUser { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    public ICollection<Branch> Branches { get; set; } = [];
    public ICollection<Employee> Employees { get; set; } = [];
    public ICollection<ServiceCategory> ServiceCategories { get; set; } = [];
    public ICollection<Service> Services { get; set; } = [];
    public ICollection<Booking> Bookings { get; set; } = [];
}
