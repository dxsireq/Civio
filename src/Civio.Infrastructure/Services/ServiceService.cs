using Civio.Application.Services;
using Civio.Contracts.Services;
using Civio.Domain.Authorization;
using Civio.Domain.Entities;
using Civio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Civio.Infrastructure.Services;

public sealed class ServiceService : IServiceService
{
    private readonly AppDbContext _dbContext;

    public ServiceService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ServiceResponse> CreateAsync(
        Guid organizationId,
        Guid requestingUserId,
        CreateServiceRequest request,
        CancellationToken cancellationToken = default)
    {
        var organization = await _dbContext.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (organization is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        if (!OrganizationAccess.IsOwner(requestingUserId, organization))
            throw new UnauthorizedAccessException("Only the owner can add services.");

        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Service name is required.");

        if (request.DurationMinutes <= 0)
            throw new ArgumentException("Duration must be positive.");

        var service = new Service
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            CategoryId = request.CategoryId,
            Name = name,
            Description = NormalizeNullable(request.Description),
            DurationMinutes = request.DurationMinutes,
            Price = request.Price,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.Services.Add(service);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(service);
    }

    public async Task<IReadOnlyList<ServiceResponse>> GetByOrganizationAsync(
        Guid organizationId,
        CancellationToken cancellationToken = default)
    {
        var orgExists = await _dbContext.Organizations
            .AsNoTracking()
            .AnyAsync(o => o.Id == organizationId, cancellationToken);

        if (!orgExists)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        return await _dbContext.Services
            .AsNoTracking()
            .Where(s => s.OrganizationId == organizationId && s.IsActive)
            .OrderBy(s => s.Name)
            .Select(s => ToResponse(s))
            .ToListAsync(cancellationToken);
    }

    public async Task<ServiceResponse> UpdateAsync(
        Guid serviceId,
        Guid organizationId,
        Guid requestingUserId,
        UpdateServiceRequest request,
        CancellationToken cancellationToken = default)
    {
        var organization = await _dbContext.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (organization is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        if (!OrganizationAccess.IsOwner(requestingUserId, organization))
            throw new UnauthorizedAccessException("Only the owner can update services.");

        var service = await _dbContext.Services
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.OrganizationId == organizationId, cancellationToken);

        if (service is null)
            throw new KeyNotFoundException($"Service {serviceId} not found.");

        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Service name is required.");

        if (request.DurationMinutes <= 0)
            throw new ArgumentException("Duration must be positive.");

        service.Name = name;
        service.Description = NormalizeNullable(request.Description);
        service.DurationMinutes = request.DurationMinutes;
        service.Price = request.Price;
        service.CategoryId = request.CategoryId;
        service.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(service);
    }

    public async Task DeactivateAsync(
        Guid serviceId,
        Guid organizationId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var organization = await _dbContext.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (organization is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        if (!OrganizationAccess.IsOwner(requestingUserId, organization))
            throw new UnauthorizedAccessException("Only the owner can deactivate services.");

        var service = await _dbContext.Services
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.OrganizationId == organizationId, cancellationToken);

        if (service is null)
            throw new KeyNotFoundException($"Service {serviceId} not found.");

        service.IsActive = false;
        service.UpdatedAt = DateTimeOffset.UtcNow;
        _dbContext.Entry(service).Property(s => s.IsActive).IsModified = true;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static ServiceResponse ToResponse(Service s) =>
        new(
            s.Id,
            s.OrganizationId,
            s.CategoryId,
            s.Name,
            s.Description,
            s.DurationMinutes,
            s.Price,
            s.IsActive,
            s.CreatedAt.UtcDateTime);

    private static string? NormalizeNullable(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
