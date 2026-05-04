namespace Civio.Contracts.Notifications;

public record NotificationResponse(
    Guid Id,
    Guid? BookingId,
    string TypeCode,
    string TypeName,
    string ChannelCode,
    string StatusCode,
    string Title,
    string Message,
    DateTimeOffset CreatedAt,
    DateTimeOffset? SentAt);
