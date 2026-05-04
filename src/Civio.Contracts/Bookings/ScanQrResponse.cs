namespace Civio.Contracts.Bookings;

public record ScanQrResponse(
    Guid BookingId,
    string CitizenFirstName,
    string CitizenLastName,
    string ServiceName,
    DateTimeOffset StartAt,
    DateTimeOffset EndAt,
    string StatusCode,
    string StatusName);
