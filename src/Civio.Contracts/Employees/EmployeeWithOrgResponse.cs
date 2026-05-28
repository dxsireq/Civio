namespace Civio.Contracts.Employees;

public sealed record EmployeeWithOrgResponse(
    Guid Id,
    Guid OrganizationId,
    string OrganizationName,
    string OrganizationCity,
    string OrganizationStatus,
    string FirstName,
    string LastName,
    string? MiddleName,
    string? Position,
    string? Phone,
    string? Email,
    bool IsActive
);
