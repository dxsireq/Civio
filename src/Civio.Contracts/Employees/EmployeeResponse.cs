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
    DateTime CreatedAt,
    /// <summary>pending | active | fired</summary>
    string MembershipStatus,
    /// <summary>pending | accepted | expired | revoked. Null when membership is active or fired.</summary>
    string? InvitationStatus
);
