using Civio.Application.Statistics;
using Civio.Contracts.Statistics;
using Civio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Civio.Infrastructure.Statistics;

public sealed class PlatformStatisticsService : IPlatformStatisticsService
{
    private readonly AppDbContext _dbContext;

    public PlatformStatisticsService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PlatformStatisticsResponse> GetAsync(
        DateTimeOffset from,
        DateTimeOffset to,
        CancellationToken cancellationToken = default)
    {
        if (from >= to)
            throw new InvalidOperationException("Invalid date range.");

        var fromUtc = from.ToUniversalTime();
        var toUtc = to.ToUniversalTime();

        // Lifetime totals — SQL aggregates, no full materialization
        var totalUsers = await _dbContext.Users
            .AsNoTracking()
            .CountAsync(cancellationToken);

        var totalOrganizations = await _dbContext.Organizations
            .AsNoTracking()
            .CountAsync(cancellationToken);

        var activeOrganizations = await _dbContext.Organizations
            .AsNoTracking()
            .CountAsync(o => o.Status.Code == "approved", cancellationToken);

        var totalBookings = await _dbContext.Bookings
            .AsNoTracking()
            .CountAsync(cancellationToken);

        var totalRevenue = await _dbContext.Bookings
            .AsNoTracking()
            .Where(b => b.Status.Code == "completed")
            .SumAsync(b => b.Service.Price ?? 0m, cancellationToken);

        var completedCount = await _dbContext.Bookings
            .AsNoTracking()
            .CountAsync(b => b.Status.Code == "completed", cancellationToken);

        var cancelledCount = await _dbContext.Bookings
            .AsNoTracking()
            .CountAsync(b => b.Status.Code == "cancelled", cancellationToken);

        var rejectedCount = await _dbContext.Bookings
            .AsNoTracking()
            .CountAsync(b => b.Status.Code == "rejected", cancellationToken);

        // Ranged totals
        var newBookingsInRange = await _dbContext.Bookings
            .AsNoTracking()
            .CountAsync(b => b.CreatedAt >= fromUtc && b.CreatedAt < toUtc, cancellationToken);

        var revenueInRange = await _dbContext.Bookings
            .AsNoTracking()
            .Where(b => b.Status.Code == "completed" && b.CreatedAt >= fromUtc && b.CreatedAt < toUtc)
            .SumAsync(b => b.Service.Price ?? 0m, cancellationToken);

        var totals = new PlatformTotals(
            TotalUsers: totalUsers,
            TotalOrganizations: totalOrganizations,
            ActiveOrganizations: activeOrganizations,
            TotalBookings: totalBookings,
            TotalRevenue: totalRevenue,
            CompletedCount: completedCount,
            CancelledCount: cancelledCount,
            RejectedCount: rejectedCount,
            NewBookingsInRange: newBookingsInRange,
            RevenueInRange: revenueInRange);

        // Revenue by day (ranged, completed) — group in SQL, zero-fill in memory
        var dayGroups = await _dbContext.Bookings
            .AsNoTracking()
            .Where(b => b.Status.Code == "completed" && b.CreatedAt >= fromUtc && b.CreatedAt < toUtc)
            .GroupBy(b => new { b.CreatedAt.Year, b.CreatedAt.Month, b.CreatedAt.Day })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                g.Key.Day,
                Revenue = g.Sum(b => b.Service.Price ?? 0m),
                Count = g.Count(),
            })
            .ToListAsync(cancellationToken);

        var byDayMap = dayGroups.ToDictionary(
            x => new DateOnly(x.Year, x.Month, x.Day),
            x => (Revenue: x.Revenue, Count: x.Count));

        var revenueByDay = new List<RevenuePoint>();
        for (var d = DateOnly.FromDateTime(fromUtc.UtcDateTime); d < DateOnly.FromDateTime(toUtc.UtcDateTime); d = d.AddDays(1))
        {
            revenueByDay.Add(byDayMap.TryGetValue(d, out var v)
                ? new RevenuePoint(d, v.Revenue, v.Count)
                : new RevenuePoint(d, 0m, 0));
        }

        // Revenue by organization (ranged, all bookings in range)
        var orgGroups = await _dbContext.Bookings
            .AsNoTracking()
            .Where(b => b.CreatedAt >= fromUtc && b.CreatedAt < toUtc)
            .GroupBy(b => new { b.OrganizationId, b.Organization.Name })
            .Select(g => new
            {
                g.Key.OrganizationId,
                g.Key.Name,
                Revenue = g.Where(b => b.Status.Code == "completed").Sum(b => b.Service.Price ?? 0m),
                BookingCount = g.Count(),
                CompletedCount = g.Count(b => b.Status.Code == "completed"),
            })
            .OrderByDescending(x => x.Revenue)
            .ToListAsync(cancellationToken);

        var revenueByOrganization = orgGroups
            .Select(x => new RevenueByOrganization(x.OrganizationId, x.Name, x.Revenue, x.BookingCount, x.CompletedCount))
            .ToList();

        // Bookings by status (ranged) — left-join every status so zeros appear
        var allStatuses = await _dbContext.BookingStatuses
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var statusCounts = await _dbContext.Bookings
            .AsNoTracking()
            .Where(b => b.CreatedAt >= fromUtc && b.CreatedAt < toUtc)
            .GroupBy(b => b.StatusId)
            .Select(g => new { StatusId = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var statusCountMap = statusCounts.ToDictionary(x => x.StatusId, x => x.Count);

        var bookingsByStatus = allStatuses
            .Select(s => new BookingsByStatus(
                s.Code,
                s.Name,
                statusCountMap.TryGetValue(s.Id, out var count) ? count : 0))
            .ToList();

        return new PlatformStatisticsResponse(
            from,
            to,
            totals,
            revenueByDay,
            revenueByOrganization,
            bookingsByStatus);
    }
}
