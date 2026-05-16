using Civio.Application.Admin;
using Civio.Contracts.Admin;
using Civio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Civio.Infrastructure.Admin;

public sealed class ActivityLogService : IActivityLogService
{
    private const int MaxPageSize = 200;
    private const int DefaultPageSize = 50;

    private readonly AppDbContext _dbContext;

    public ActivityLogService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ActivityLogPageDto> GetActivityLogAsync(
        string? entityType,
        Guid? actorId,
        DateTimeOffset? from,
        DateTimeOffset? to,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = DefaultPageSize;
        if (pageSize > MaxPageSize) pageSize = MaxPageSize;

        var includeOrg = string.IsNullOrEmpty(entityType) || entityType == "organization";
        var includeBooking = string.IsNullOrEmpty(entityType) || entityType == "booking";

        var orgItems = includeOrg
            ? await LoadOrgItemsAsync(actorId, from, to, cancellationToken)
            : [];

        var bookingItems = includeBooking
            ? await LoadBookingItemsAsync(actorId, from, to, cancellationToken)
            : [];

        var merged = orgItems
            .Concat(bookingItems)
            .OrderByDescending(i => i.OccurredAt)
            .ToList();

        var total = merged.Count;
        var pageItems = merged
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToArray();

        return new ActivityLogPageDto(pageItems, total, page, pageSize);
    }

    private async Task<List<ActivityLogItemDto>> LoadOrgItemsAsync(
        Guid? actorId,
        DateTimeOffset? from,
        DateTimeOffset? to,
        CancellationToken ct)
    {
        var query = _dbContext.OrganizationModerationHistory
            .AsNoTracking()
            .Include(h => h.Organization)
            .Include(h => h.OldStatus)
            .Include(h => h.NewStatus)
            .Include(h => h.Moderator)
            .AsQueryable();

        if (actorId.HasValue)
            query = query.Where(h => h.ModeratorId == actorId.Value);

        if (from.HasValue)
            query = query.Where(h => h.CreatedAt >= from.Value);

        if (to.HasValue)
            query = query.Where(h => h.CreatedAt <= to.Value);

        var rows = await query.ToListAsync(ct);

        return rows
            .Select(h => new ActivityLogItemDto(
                h.Id,
                h.CreatedAt,
                $"organization.{h.NewStatus.Code}",
                "organization",
                h.OrganizationId,
                h.Organization?.Name,
                h.ModeratorId,
                h.Moderator?.Email,
                FormatName(h.Moderator?.LastName, h.Moderator?.FirstName),
                h.OldStatus?.Code,
                h.NewStatus.Code,
                h.Comment))
            .ToList();
    }

    private async Task<List<ActivityLogItemDto>> LoadBookingItemsAsync(
        Guid? actorId,
        DateTimeOffset? from,
        DateTimeOffset? to,
        CancellationToken ct)
    {
        var query = _dbContext.BookingStatusHistory
            .AsNoTracking()
            .Include(h => h.Booking).ThenInclude(b => b.Service)
            .Include(h => h.Booking).ThenInclude(b => b.Citizen)
            .Include(h => h.OldStatus)
            .Include(h => h.NewStatus)
            .Include(h => h.ChangedBy)
            .AsQueryable();

        if (actorId.HasValue)
            query = query.Where(h => h.ChangedById == actorId.Value);

        if (from.HasValue)
            query = query.Where(h => h.CreatedAt >= from.Value);

        if (to.HasValue)
            query = query.Where(h => h.CreatedAt <= to.Value);

        var rows = await query.ToListAsync(ct);

        return rows
            .Select(h => new ActivityLogItemDto(
                h.Id,
                h.CreatedAt,
                "booking.status_changed",
                "booking",
                h.BookingId,
                BuildBookingName(h),
                h.ChangedById,
                h.ChangedBy?.Email,
                FormatName(h.ChangedBy?.LastName, h.ChangedBy?.FirstName),
                h.OldStatus?.Code,
                h.NewStatus.Code,
                h.Comment))
            .ToList();
    }

    private static string? BuildBookingName(Domain.Entities.BookingStatusHistory h)
    {
        var service = h.Booking?.Service?.Name;
        var citizen = h.Booking?.Citizen?.Email;
        if (service is null && citizen is null) return null;
        if (service is null) return citizen;
        if (citizen is null) return service;
        return $"{service} · {citizen}";
    }

    private static string? FormatName(string? lastName, string? firstName)
    {
        var parts = new[] { lastName, firstName }
            .Where(p => !string.IsNullOrWhiteSpace(p))
            .ToArray();
        return parts.Length == 0 ? null : string.Join(" ", parts);
    }
}
