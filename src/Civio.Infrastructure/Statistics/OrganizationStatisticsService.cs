using Civio.Application.Statistics;
using Civio.Contracts.Statistics;
using Civio.Domain.Authorization;
using Civio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Civio.Infrastructure.Statistics;

public sealed class OrganizationStatisticsService : IOrganizationStatisticsService
{
    private readonly AppDbContext _dbContext;

    public OrganizationStatisticsService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<OrganizationStatisticsResponse> GetAsync(
        Guid organizationId,
        Guid requestingUserId,
        DateTimeOffset from,
        DateTimeOffset to,
        CancellationToken cancellationToken = default,
        bool bypassOwnerCheck = false)
    {
        if (from >= to)
            throw new InvalidOperationException("Invalid date range.");

        var org = await _dbContext.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (org is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        if (!bypassOwnerCheck && !OrganizationAccess.IsOwner(requestingUserId, org))
            throw new UnauthorizedAccessException("Access denied.");

        var fromUtc = from.ToUniversalTime();
        var toUtc = to.ToUniversalTime();

        var bookings = await _dbContext.Bookings
            .AsNoTracking()
            .Include(b => b.Status)
            .Include(b => b.Service)
            .Include(b => b.Employee)
            .Where(b => b.OrganizationId == organizationId)
            .ToListAsync(cancellationToken);

        // Lifetime totals
        var completedAll = bookings.Where(b => b.Status.Code == "completed").ToList();
        var totals = new OrgStatisticsTotals(
            TotalRevenue: completedAll.Sum(b => b.Service.Price ?? 0m),
            CompletedCount: completedAll.Count,
            TotalBookings: bookings.Count,
            CancelledCount: bookings.Count(b => b.Status.Code == "cancelled"),
            RejectedCount: bookings.Count(b => b.Status.Code == "rejected"));

        // Ranged bookings [fromUtc, toUtc)
        var ranged = bookings
            .Where(b => b.CreatedAt >= fromUtc && b.CreatedAt < toUtc)
            .ToList();

        var rangedCompleted = ranged
            .Where(b => b.Status.Code == "completed")
            .ToList();

        // Revenue by day — fill every day in [from, to) with zero if no bookings
        var byDayMap = rangedCompleted
            .GroupBy(b => DateOnly.FromDateTime(b.CreatedAt.UtcDateTime))
            .ToDictionary(g => g.Key, g => (Revenue: g.Sum(b => b.Service.Price ?? 0m), Count: g.Count()));

        var revenueByDay = new List<RevenuePoint>();
        for (var d = DateOnly.FromDateTime(fromUtc.UtcDateTime); d < DateOnly.FromDateTime(toUtc.UtcDateTime); d = d.AddDays(1))
        {
            revenueByDay.Add(byDayMap.TryGetValue(d, out var v)
                ? new RevenuePoint(d, v.Revenue, v.Count)
                : new RevenuePoint(d, 0m, 0));
        }

        var revenueByService = rangedCompleted
            .GroupBy(b => new { b.ServiceId, b.Service.Name })
            .Select(g => new RevenueByService(
                g.Key.ServiceId,
                g.Key.Name,
                g.Sum(b => b.Service.Price ?? 0m),
                g.Count()))
            .OrderByDescending(x => x.Revenue)
            .ToList();

        var revenueByEmployee = rangedCompleted
            .Where(b => b.EmployeeId.HasValue && b.Employee is not null)
            .GroupBy(b => new { EmployeeId = b.EmployeeId!.Value, b.Employee!.FirstName, b.Employee.LastName })
            .Select(g => new RevenueByEmployee(
                g.Key.EmployeeId,
                g.Key.FirstName,
                g.Key.LastName,
                g.Sum(b => b.Service.Price ?? 0m),
                g.Count()))
            .OrderByDescending(x => x.Revenue)
            .ToList();

        var allStatuses = await _dbContext.BookingStatuses
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var statusCountMap = ranged
            .GroupBy(b => b.StatusId)
            .ToDictionary(g => g.Key, g => g.Count());

        var bookingsByStatus = allStatuses
            .Select(s => new BookingsByStatus(
                s.Code,
                s.Name,
                statusCountMap.TryGetValue(s.Id, out var count) ? count : 0))
            .ToList();

        return new OrganizationStatisticsResponse(
            organizationId,
            from,
            to,
            totals,
            revenueByDay,
            revenueByService,
            revenueByEmployee,
            bookingsByStatus);
    }
}
