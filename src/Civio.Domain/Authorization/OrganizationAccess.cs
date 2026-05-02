namespace Civio.Domain.Authorization;

public static class OrganizationAccess
{
    public static bool IsOwner(Guid userId, Entities.Organization org) =>
        org.OwnerUserId == userId;

    public static bool IsEmployee(Guid userId, Guid organizationId,
        IEnumerable<Entities.Employee> employees) =>
        employees.Any(e => e.UserId == userId && e.OrganizationId == organizationId);
}
