namespace Civio.Domain.Entities;

public sealed class Notification
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid? BookingId { get; set; }
    public Booking? Booking { get; set; }

    public Guid TypeId { get; set; }
    public NotificationType Type { get; set; } = null!;

    public Guid ChannelId { get; set; }
    public NotificationChannel Channel { get; set; } = null!;

    public Guid StatusId { get; set; }
    public NotificationStatus Status { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? SentAt { get; set; }
}
