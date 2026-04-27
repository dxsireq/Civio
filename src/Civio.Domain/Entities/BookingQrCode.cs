namespace Civio.Domain.Entities;

public sealed class BookingQrCode
{
    public Guid Id { get; set; }

    public Guid BookingId { get; set; }
    public Booking Booking { get; set; } = null!;

    public string Token { get; set; } = string.Empty;

    public DateTimeOffset? ExpiresAt { get; set; }
    public DateTimeOffset? UsedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
