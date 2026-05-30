namespace Civio.Contracts.Statistics;

public sealed record OrganizationStatisticsResponse(
    Guid OrganizationId,
    DateTimeOffset From,
    DateTimeOffset To,
    OrgStatisticsTotals Totals,
    IReadOnlyList<RevenuePoint> RevenueByDay,
    IReadOnlyList<RevenueByService> RevenueByService,
    IReadOnlyList<RevenueByEmployee> RevenueByEmployee,
    IReadOnlyList<BookingsByStatus> BookingsByStatus);

public sealed record OrgStatisticsTotals(
    decimal TotalRevenue,
    int CompletedCount,
    int TotalBookings,
    int CancelledCount,
    int RejectedCount);

public sealed record RevenuePoint(DateOnly Date, decimal Revenue, int Count);

public sealed record RevenueByService(Guid ServiceId, string ServiceName, decimal Revenue, int Count);

public sealed record RevenueByEmployee(Guid EmployeeId, string FirstName, string LastName, decimal Revenue, int Count);

public sealed record BookingsByStatus(string StatusCode, string StatusName, int Count);
