namespace Civio.Contracts.Slots;

public sealed record AvailableSlotResponse(
    Guid EmployeeId,
    string EmployeeFirstName,
    string EmployeeLastName,
    DateTimeOffset StartAt,
    DateTimeOffset EndAt
);
