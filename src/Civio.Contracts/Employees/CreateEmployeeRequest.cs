namespace Civio.Contracts.Employees;

public sealed record CreateEmployeeRequest(
    string FirstName,
    string LastName,
    string Email,
    string? MiddleName,
    string? Position,
    string? Phone
);
