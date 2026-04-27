namespace Civio.Domain.Entities;

public sealed class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }

    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = [];
    public ICollection<Organization> OwnedOrganizations { get; set; } = [];
    public ICollection<Employee> EmployeeProfiles { get; set; } = [];
    public ICollection<Booking> Bookings { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
    public ICollection<DevicePushToken> DevicePushTokens { get; set; } = [];
}
