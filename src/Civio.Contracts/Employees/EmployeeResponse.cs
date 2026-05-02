namespace Civio.Contracts.Employees;

public sealed record EmployeeResponse(
    Guid Id,
    Guid OrganizationId,
    Guid? UserId,
    string FirstName,
    string LastName,
    string? MiddleName,
    string? Position,
    string? Phone,
    string? Email,
    bool IsActive,
    DateTime CreatedAt
);
