using Civio.Contracts.Notifications;

namespace Civio.Application.Notifications;

public interface INotificationService
{
    Task NotifyBookingStatusChangedAsync(
        Guid citizenId,
        Guid bookingId,
        string newStatusCode,
        string serviceName,
        DateTimeOffset? slotStartAt,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<NotificationResponse>> GetMyAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}
