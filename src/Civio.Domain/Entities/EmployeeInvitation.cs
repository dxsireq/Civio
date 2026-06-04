namespace Civio.Domain.Entities;

public sealed class EmployeeInvitation
{
    public Guid Id { get; set; }

    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;

    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;

    /// <summary>pending | accepted | expired | revoked</summary>
    public string Status { get; set; } = "pending";

    public Guid? InvitedBy { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? AcceptedAt { get; set; }
}
