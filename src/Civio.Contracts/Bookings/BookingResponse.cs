namespace Civio.Contracts.Bookings;

public sealed record BookingResponse(
    Guid Id,
    Guid OrganizationId,
    Guid ServiceId,
    string ServiceName,
    Guid? EmployeeId,
    string? EmployeeFirstName,
    string? EmployeeLastName,
    Guid CitizenId,
    string StatusCode,
    string StatusName,
    string? Comment,
    DateTimeOffset StartAt,
    DateTimeOffset EndAt,
    DateTimeOffset CreatedAt
);
