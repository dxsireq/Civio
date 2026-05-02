namespace Civio.Contracts.Bookings;

public sealed record CreateBookingRequest(
    Guid OrganizationId,
    Guid ServiceId,
    Guid EmployeeId,
    DateTimeOffset StartAt,
    string? Comment
);
