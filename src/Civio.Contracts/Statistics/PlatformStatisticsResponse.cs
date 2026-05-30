namespace Civio.Contracts.Statistics;

public sealed record PlatformStatisticsResponse(
    DateTimeOffset From,
    DateTimeOffset To,
    PlatformTotals Totals,
    IReadOnlyList<RevenuePoint> RevenueByDay,
    IReadOnlyList<RevenueByOrganization> RevenueByOrganization,
    IReadOnlyList<BookingsByStatus> BookingsByStatus);

public sealed record PlatformTotals(
    int TotalUsers,
    int TotalOrganizations,
    int ActiveOrganizations,
    int TotalBookings,
    decimal TotalRevenue,
    int CompletedCount,
    int CancelledCount,
    int RejectedCount,
    int NewBookingsInRange,
    decimal RevenueInRange);

public sealed record RevenueByOrganization(
    Guid OrganizationId,
    string OrganizationName,
    decimal Revenue,
    int BookingCount,
    int CompletedCount);
