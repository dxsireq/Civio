namespace Civio.Contracts.Bookings;

public sealed record BookingSummaryResponse(
    Guid Id,
    Guid OrganizationId,
    string OrganizationName,
    Guid ServiceId,
    string ServiceName,
    Guid? EmployeeId,
    string? EmployeeFirstName,
    string? EmployeeLastName,
    Guid CitizenId,
    string StatusCode,
    string? Comment,
    DateTimeOffset StartAt,
    DateTimeOffset CreatedAt
);
