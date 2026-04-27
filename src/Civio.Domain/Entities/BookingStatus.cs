namespace Civio.Domain.Entities;

public sealed class BookingStatus
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    public ICollection<Booking> Bookings { get; set; } = [];
}
