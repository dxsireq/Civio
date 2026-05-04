using Civio.Application.Admin;
using Civio.Contracts.Admin;
using Civio.Contracts.Organizations;
using Civio.Domain.Entities;
using Civio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Civio.Infrastructure.Admin;

public sealed class AdminService : IAdminService
{
    private readonly AppDbContext _dbContext;

    public AdminService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<OrganizationResponse>> GetAllOrganizationsAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Organizations
            .AsNoTracking()
            .Include(o => o.Status)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => ToResponse(o))
            .ToListAsync(cancellationToken);
    }

    public Task<OrganizationResponse> ApproveOrganizationAsync(
        Guid organizationId,
        Guid moderatorId,
        ModerationRequest request,
        CancellationToken cancellationToken = default) =>
        ChangeStatusAsync(organizationId, moderatorId, "approved", request.Comment, cancellationToken);

    public Task<OrganizationResponse> RejectOrganizationAsync(
        Guid organizationId,
        Guid moderatorId,
        ModerationRequest request,
        CancellationToken cancellationToken = default) =>
        ChangeStatusAsync(organizationId, moderatorId, "rejected", request.Comment, cancellationToken);

    public Task<OrganizationResponse> BlockOrganizationAsync(
        Guid organizationId,
        Guid moderatorId,
        ModerationRequest request,
        CancellationToken cancellationToken = default) =>
        ChangeStatusAsync(organizationId, moderatorId, "blocked", request.Comment, cancellationToken);

    private async Task<OrganizationResponse> ChangeStatusAsync(
        Guid organizationId,
        Guid moderatorId,
        string newStatusCode,
        string? comment,
        CancellationToken cancellationToken)
    {
        var org = await _dbContext.Organizations
            .Include(o => o.Status)
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (org is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        var newStatus = await _dbContext.OrganizationStatuses
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Code == newStatusCode, cancellationToken);

        if (newStatus is null)
            throw new InvalidOperationException($"Status '{newStatusCode}' not found.");

        var history = new OrganizationModerationHistory
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            ModeratorId = moderatorId,
            OldStatusId = org.StatusId,
            NewStatusId = newStatus.Id,
            Comment = comment,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.OrganizationModerationHistory.Add(history);

        org.StatusId = newStatus.Id;
        org.Status = newStatus;
        org.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(org);
    }

    private static OrganizationResponse ToResponse(Organization o) =>
        new(
            o.Id,
            o.OwnerUserId ?? Guid.Empty,
            o.Name,
            o.Status.Code,
            o.City,
            o.Address,
            o.Description,
            o.Email,
            o.Phone,
            o.Website,
            o.CreatedAt.UtcDateTime);
}
