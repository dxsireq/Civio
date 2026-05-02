namespace Civio.Contracts.Employees;

public sealed record UpdateEmployeeRequest(
    string FirstName,
    string LastName,
    string? MiddleName,
    string? Position,
    string? Phone,
    string? Email
);
