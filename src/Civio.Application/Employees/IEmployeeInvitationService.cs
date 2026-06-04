using Civio.Contracts.Auth;
using Civio.Contracts.Invitations;

namespace Civio.Application.Employees;

public interface IEmployeeInvitationService
{
    /// <summary>Returns invitation metadata for pre-filling the registration form. Public endpoint.</summary>
    Task<InvitationInfoResponse> GetByTokenAsync(
        string token,
        CancellationToken cancellationToken = default);

    /// <summary>Creates a new User, links to the employee, and returns a JWT. For users who are not yet registered.</summary>
    Task<AuthResponse> AcceptWithRegistrationAsync(
        string token,
        AcceptInvitationRegisterRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>Links an already-authenticated user to the employee. Email of the user must match the invitation email.</summary>
    Task AcceptAsync(
        string token,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>Revokes a pending invitation and deletes the pending employee record.</summary>
    Task RevokeAsync(
        Guid organizationId,
        Guid employeeId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default);

    /// <summary>Revokes current pending invitation and sends a new one.</summary>
    Task ResendAsync(
        Guid organizationId,
        Guid employeeId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default);
}
