namespace Civio.Domain.Entities;

public sealed class OrganizationModerationHistory
{
    public Guid Id { get; set; }

    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;

    public Guid? ModeratorId { get; set; }
    public User? Moderator { get; set; }

    public Guid? OldStatusId { get; set; }
    public OrganizationStatus? OldStatus { get; set; }

    public Guid NewStatusId { get; set; }
    public OrganizationStatus NewStatus { get; set; } = null!;

    public string? Comment { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
