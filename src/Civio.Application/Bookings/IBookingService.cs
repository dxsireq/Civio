using Civio.Contracts.Bookings;

namespace Civio.Application.Bookings;

public interface IBookingService
{
    Task<BookingResponse> CreateAsync(
        Guid citizenId,
        CreateBookingRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BookingSummaryResponse>> GetMyBookingsAsync(
        Guid citizenId,
        CancellationToken cancellationToken = default);

    Task<BookingResponse> GetByIdAsync(
        Guid bookingId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default);

    Task<BookingResponse> CancelAsync(
        Guid bookingId,
        Guid citizenId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BookingSummaryResponse>> GetByOrganizationAsync(
        Guid organizationId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default);

    Task<BookingResponse> ConfirmAsync(
        Guid bookingId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default);

    Task<BookingResponse> RejectAsync(
        Guid bookingId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default);

    Task<BookingResponse> CompleteAsync(
        Guid bookingId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default);
}
