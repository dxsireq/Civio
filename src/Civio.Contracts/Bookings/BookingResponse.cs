namespace Civio.Contracts.Bookings;

public sealed record BookingResponse(
    Guid Id,
    Guid OrganizationId,
    string OrganizationName,
    string OrganizationCity,
    string OrganizationAddress,
    Guid ServiceId,
    string ServiceName,
    decimal? Price,
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
