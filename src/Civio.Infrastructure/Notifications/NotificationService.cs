using Civio.Application.Notifications;
using Civio.Contracts.Notifications;
using Civio.Domain.Entities;
using Civio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Civio.Infrastructure.Notifications;

public sealed class NotificationService : INotificationService
{
    private readonly AppDbContext _dbContext;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        AppDbContext dbContext,
        IEmailSender emailSender,
        ILogger<NotificationService> logger)
    {
        _dbContext = dbContext;
        _emailSender = emailSender;
        _logger = logger;
    }

    public async Task NotifyBookingStatusChangedAsync(
        Guid citizenId,
        Guid bookingId,
        string newStatusCode,
        string serviceName,
        DateTimeOffset? slotStartAt,
        CancellationToken cancellationToken = default)
    {
        var typeCode = newStatusCode switch
        {
            "created"   => "booking_created",
            "confirmed" => "booking_confirmed",
            "cancelled" => "booking_cancelled",
            "completed" => "booking_completed",
            _           => null
        };

        if (typeCode is null)
            return;

        var type = await _dbContext.NotificationTypes
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Code == typeCode, cancellationToken);

        if (type is null)
            return;

        var channel = await _dbContext.NotificationChannels
            .AsNoTracking()
            .FirstAsync(c => c.Code == "email", cancellationToken);

        var createdStatus = await _dbContext.NotificationStatuses
            .AsNoTracking()
            .FirstAsync(s => s.Code == "created", cancellationToken);

        var user = await _dbContext.Users
            .AsNoTracking()
            .FirstAsync(u => u.Id == citizenId, cancellationToken);

        var (title, message) = BuildContent(typeCode, serviceName, slotStartAt);

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = citizenId,
            BookingId = bookingId,
            TypeId = type.Id,
            ChannelId = channel.Id,
            StatusId = createdStatus.Id,
            Title = title,
            Message = message,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.Notifications.Add(notification);
        await _dbContext.SaveChangesAsync(cancellationToken);

        try
        {
            await _emailSender.SendAsync(user.Email, title, message, cancellationToken);

            var sentStatus = await _dbContext.NotificationStatuses
                .AsNoTracking()
                .FirstAsync(s => s.Code == "sent", cancellationToken);

            notification.StatusId = sentStatus.Id;
            notification.SentAt = DateTimeOffset.UtcNow;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send email notification {NotificationId}", notification.Id);

            var failedStatus = await _dbContext.NotificationStatuses
                .AsNoTracking()
                .FirstAsync(s => s.Code == "failed", cancellationToken);

            notification.StatusId = failedStatus.Id;
            notification.ErrorMessage = ex.Message;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<NotificationResponse>> GetMyAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId)
            .Include(n => n.Type)
            .Include(n => n.Channel)
            .Include(n => n.Status)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationResponse(
                n.Id,
                n.BookingId,
                n.Type.Code,
                n.Type.Name,
                n.Channel.Code,
                n.Status.Code,
                n.Title,
                n.Message,
                n.CreatedAt,
                n.SentAt))
            .ToListAsync(cancellationToken);
    }

    private static (string title, string message) BuildContent(
        string typeCode,
        string serviceName,
        DateTimeOffset? slotStartAt)
    {
        var dateStr = slotStartAt.HasValue
            ? slotStartAt.Value.ToString("dd.MM.yyyy HH:mm")
            : string.Empty;

        return typeCode switch
        {
            "booking_created" => (
                "Запись создана",
                $"Вы записались на услугу «{serviceName}»{(dateStr.Length > 0 ? $" на {dateStr}" : string.Empty)}."),

            "booking_confirmed" => (
                "Запись подтверждена",
                $"Ваша запись на услугу «{serviceName}»{(dateStr.Length > 0 ? $" на {dateStr}" : string.Empty)} подтверждена."),

            "booking_cancelled" => (
                "Запись отменена",
                $"Ваша запись на услугу «{serviceName}»{(dateStr.Length > 0 ? $" на {dateStr}" : string.Empty)} отменена."),

            "booking_completed" => (
                "Запись завершена",
                $"Ваша запись на услугу «{serviceName}»{(dateStr.Length > 0 ? $" на {dateStr}" : string.Empty)} завершена. Спасибо за визит!"),

            _ => ("Уведомление", string.Empty)
        };
    }
}
