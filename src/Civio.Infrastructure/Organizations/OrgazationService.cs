using Civio.Application.Organizations;
using Civio.Contracts.Organizations;
using Civio.Domain.Authorization;
using Civio.Domain.Entities;
using Civio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Civio.Infrastructure.Organizations;

public sealed class OrganizationService : IOrganizationService
{
    private readonly AppDbContext _dbContext;

    public OrganizationService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<OrganizationResponse> CreateAsync(
        Guid ownerUserId,
        CreateOrganizationRequest request,
        CancellationToken cancellationToken = default)
    {
        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Organization name is required.");

        if (name.Length > 200)
            throw new ArgumentException("Organization name is too long.");

        var pendingStatus = await _dbContext.OrganizationStatuses
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Code == "pending", cancellationToken);

        if (pendingStatus is null)
            throw new InvalidOperationException("Organization status 'pending' was not found.");

        var organization = new Organization
        {
            Id = Guid.NewGuid(),
            OwnerUserId = ownerUserId,
            StatusId = pendingStatus.Id,
            Name = name,
            Description = NormalizeNullable(request.Description),
            Email = NormalizeNullable(request.Email),
            Phone = NormalizeNullable(request.Phone),
            Website = NormalizeNullable(request.Website),
            CreatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.Organizations.Add(organization);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new OrganizationResponse(
            organization.Id,
            organization.OwnerUserId!.Value,
            organization.Name,
            pendingStatus.Code,
            organization.Description,
            organization.Email,
            organization.Phone,
            organization.Website,
            organization.CreatedAt.UtcDateTime
        );
    }

    public async Task<IReadOnlyList<OrganizationResponse>> GetMyAsync(
        Guid ownerUserId,
        CancellationToken cancellationToken = default)
    {
        var organizations = await _dbContext.Organizations
            .AsNoTracking()
            .Include(o => o.Status)
            .Where(o => o.OwnerUserId == ownerUserId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);

        return organizations
            .Select(o => new OrganizationResponse(
                o.Id,
                o.OwnerUserId!.Value,
                o.Name,
                o.Status.Code,
                o.Description,
                o.Email,
                o.Phone,
                o.Website,
                o.CreatedAt.UtcDateTime))
            .ToList();
    }

    public async Task<OrganizationResponse> GetByIdAsync(
        Guid id,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var organization = await _dbContext.Organizations
            .AsNoTracking()
            .Include(o => o.Status)
            .Include(o => o.Employees)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (organization is null)
            throw new KeyNotFoundException($"Organization {id} not found.");

        var hasAccess = OrganizationAccess.IsOwner(requestingUserId, organization)
            || OrganizationAccess.IsEmployee(requestingUserId, id, organization.Employees);

        if (!hasAccess)
            throw new UnauthorizedAccessException("Access denied.");

        return new OrganizationResponse(
            organization.Id,
            organization.OwnerUserId!.Value,
            organization.Name,
            organization.Status.Code,
            organization.Description,
            organization.Email,
            organization.Phone,
            organization.Website,
            organization.CreatedAt.UtcDateTime);
    }

    public async Task<OrganizationResponse> UpdateAsync(
        Guid id,
        Guid requestingUserId,
        UpdateOrganizationRequest request,
        CancellationToken cancellationToken = default)
    {
        var organization = await _dbContext.Organizations
            .Include(o => o.Status)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (organization is null)
            throw new KeyNotFoundException($"Organization {id} not found.");

        if (!OrganizationAccess.IsOwner(requestingUserId, organization))
            throw new UnauthorizedAccessException("Only the owner can edit this organization.");

        organization.Name = request.Name.Trim();
        organization.Description = NormalizeNullable(request.Description);
        organization.Email = NormalizeNullable(request.Email);
        organization.Phone = NormalizeNullable(request.Phone);
        organization.Website = NormalizeNullable(request.Website);
        organization.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new OrganizationResponse(
            organization.Id,
            organization.OwnerUserId!.Value,
            organization.Name,
            organization.Status.Code,
            organization.Description,
            organization.Email,
            organization.Phone,
            organization.Website,
            organization.CreatedAt.UtcDateTime);
    }

    private static string? NormalizeNullable(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}
