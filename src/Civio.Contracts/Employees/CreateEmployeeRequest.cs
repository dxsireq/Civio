namespace Civio.Contracts.Employees;

public sealed record CreateEmployeeRequest(
    string FirstName,
    string LastName,
    string? MiddleName,
    string? Position,
    string? Phone,
    string? Email,
    Guid? BranchId,
    Guid? UserId
);
