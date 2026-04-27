using Civio.Application.Organizations;
using Civio.Contracts.Organizations;
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

    private static string? NormalizeNullable(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}
