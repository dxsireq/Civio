using System.Security.Cryptography;
using Civio.Application.Bookings;
using Civio.Application.Notifications;
using Civio.Application.Slots;
using Civio.Contracts.Bookings;
using Civio.Domain.Authorization;
using Civio.Domain.Entities;
using Civio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Civio.Infrastructure.Bookings;

public sealed class BookingService : IBookingService
{
    private readonly AppDbContext _dbContext;
    private readonly SlotCalculationService _slotCalculator;
    private readonly INotificationService _notificationService;

    public BookingService(
        AppDbContext dbContext,
        SlotCalculationService slotCalculator,
        INotificationService notificationService)
    {
        _dbContext = dbContext;
        _slotCalculator = slotCalculator;
        _notificationService = notificationService;
    }

    public async Task<BookingResponse> CreateAsync(
        Guid citizenId,
        CreateBookingRequest request,
        CancellationToken cancellationToken = default)
    {
        var employee = await _dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e =>
                e.Id == request.EmployeeId &&
                e.OrganizationId == request.OrganizationId &&
                e.IsActive, cancellationToken);

        if (employee is null)
            throw new KeyNotFoundException($"Employee {request.EmployeeId} not found in organization.");

        var offersService = await _dbContext.EmployeeServices
            .AsNoTracking()
            .AnyAsync(es => es.EmployeeId == request.EmployeeId && es.ServiceId == request.ServiceId, cancellationToken);

        if (!offersService)
            throw new InvalidOperationException("Employee does not offer this service.");

        var service = await _dbContext.Services
            .AsNoTracking()
            .FirstOrDefaultAsync(s =>
                s.Id == request.ServiceId &&
                s.OrganizationId == request.OrganizationId &&
                s.IsActive, cancellationToken);

        if (service is null)
            throw new KeyNotFoundException($"Service {request.ServiceId} not found.");

        var organization = await _dbContext.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == request.OrganizationId, cancellationToken);

        if (organization is null)
            throw new KeyNotFoundException($"Organization {request.OrganizationId} not found.");

        var startAtUtc = request.StartAt.ToUniversalTime();

        if (startAtUtc <= DateTimeOffset.UtcNow)
            throw new InvalidOperationException("Cannot book a slot in the past.");

        var date = DateOnly.FromDateTime(startAtUtc.DateTime);

        var workDay = await _dbContext.WorkDays
            .AsNoTracking()
            .FirstOrDefaultAsync(w =>
                w.EmployeeId == request.EmployeeId &&
                w.WorkDate == date &&
                w.IsWorking, cancellationToken);

        if (workDay is null)
            throw new InvalidOperationException($"No work day found for employee on {date}.");

        var dayStart = new DateTimeOffset(date.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
        var dayEnd = dayStart.AddDays(1);

        var existingSlots = await _dbContext.BookingSlots
            .AsNoTracking()
            .Where(s => s.EmployeeId == request.EmployeeId && s.StartAt >= dayStart && s.StartAt < dayEnd)
            .ToListAsync(cancellationToken);

        var freeSlots = _slotCalculator.GetAvailableSlots(workDay, existingSlots, service.DurationMinutes);
        var requestedTime = TimeOnly.FromTimeSpan(startAtUtc.TimeOfDay);

        if (!freeSlots.Any(s => s.Start == requestedTime))
            throw new InvalidOperationException("Requested time slot is not available.");

        var bookingStatusCreated = await _dbContext.BookingStatuses
            .AsNoTracking()
            .FirstAsync(s => s.Code == "created", cancellationToken);

        var slotStatusBooked = await _dbContext.SlotStatuses
            .AsNoTracking()
            .FirstAsync(s => s.Code == "booked", cancellationToken);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        await _dbContext.Database.ExecuteSqlRawAsync(
            "SELECT id FROM work_days WHERE id = {0} FOR UPDATE",
            [workDay.Id],
            cancellationToken);

        var slotsAfterLock = await _dbContext.BookingSlots
            .Where(s => s.EmployeeId == request.EmployeeId && s.StartAt >= dayStart && s.StartAt < dayEnd)
            .ToListAsync(cancellationToken);

        var freeSlotsAfterLock = _slotCalculator.GetAvailableSlots(workDay, slotsAfterLock, service.DurationMinutes);

        if (!freeSlotsAfterLock.Any(s => s.Start == requestedTime))
            throw new InvalidOperationException("Requested time slot was taken by another booking.");

        var endAt = startAtUtc.AddMinutes(service.DurationMinutes);

        var bookingSlot = new BookingSlot
        {
            Id = Guid.NewGuid(),
            EmployeeId = request.EmployeeId,
            ServiceId = request.ServiceId,
            WorkDayId = workDay.Id,
            StatusId = slotStatusBooked.Id,
            StartAt = startAtUtc,
            EndAt = endAt,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.BookingSlots.Add(bookingSlot);

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            CitizenId = citizenId,
            OrganizationId = request.OrganizationId,
            EmployeeId = request.EmployeeId,
            ServiceId = request.ServiceId,
            SlotId = bookingSlot.Id,
            StatusId = bookingStatusCreated.Id,
            Comment = NormalizeNullable(request.Comment),
            CreatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.Bookings.Add(booking);

        var qrToken = GenerateQrToken();

        var qrCode = new BookingQrCode
        {
            Id = Guid.NewGuid(),
            BookingId = booking.Id,
            Token = qrToken,
            ExpiresAt = startAtUtc.AddDays(1),
            CreatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.BookingQrCodes.Add(qrCode);

        var statusHistory = new BookingStatusHistory
        {
            Id = Guid.NewGuid(),
            BookingId = booking.Id,
            OldStatusId = null,
            NewStatusId = bookingStatusCreated.Id,
            ChangedById = citizenId,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.BookingStatusHistory.Add(statusHistory);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        await _notificationService.NotifyBookingStatusChangedAsync(
            citizenId, booking.Id, "created", service.Name, bookingSlot.StartAt, cancellationToken);

        return new BookingResponse(
            booking.Id,
            booking.OrganizationId,
            organization.Name,
            organization.City,
            organization.Address,
            booking.ServiceId,
            service.Name,
            service.Price,
            booking.EmployeeId,
            employee.FirstName,
            employee.LastName,
            booking.CitizenId,
            bookingStatusCreated.Code,
            bookingStatusCreated.Name,
            booking.Comment,
            bookingSlot.StartAt,
            bookingSlot.EndAt,
            booking.CreatedAt);
    }

    public async Task<IReadOnlyList<BookingSummaryResponse>> GetMyBookingsAsync(
        Guid citizenId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Bookings
            .AsNoTracking()
            .Where(b => b.CitizenId == citizenId)
            .Include(b => b.Organization)
            .Include(b => b.Service)
            .Include(b => b.Employee)
            .Include(b => b.Status)
            .Include(b => b.Slot)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => ToSummary(b))
            .ToListAsync(cancellationToken);
    }

    public async Task<BookingResponse> GetByIdAsync(
        Guid bookingId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var booking = await _dbContext.Bookings
            .AsNoTracking()
            .Include(b => b.Organization)
            .Include(b => b.Service)
            .Include(b => b.Employee)
            .Include(b => b.Status)
            .Include(b => b.Slot)
            .FirstOrDefaultAsync(b => b.Id == bookingId, cancellationToken);

        if (booking is null)
            throw new KeyNotFoundException($"Booking {bookingId} not found.");

        var isCitizen = booking.CitizenId == requestingUserId;

        var isOrgMember = false;
        if (!isCitizen)
        {
            var org = await _dbContext.Organizations
                .AsNoTracking()
                .Include(o => o.Employees)
                .FirstOrDefaultAsync(o => o.Id == booking.OrganizationId, cancellationToken);

            isOrgMember = org is not null &&
                (OrganizationAccess.IsOwner(requestingUserId, org) ||
                 OrganizationAccess.IsEmployee(requestingUserId, booking.OrganizationId, org.Employees));
        }

        if (!isCitizen && !isOrgMember)
            throw new UnauthorizedAccessException("Access denied.");

        return ToResponse(booking);
    }

    public async Task<BookingResponse> CancelAsync(
        Guid bookingId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var booking = await LoadBookingForUpdateAsync(bookingId, cancellationToken);

        if (booking.CitizenId == requestingUserId)
        {
            // Citizen can cancel only while the booking is still pending confirmation.
            if (booking.Status.Code != "created")
                throw new InvalidOperationException($"Cannot cancel booking in status '{booking.Status.Code}'.");
        }
        else
        {
            // Org owner or the booking's assigned employee can cancel a confirmed booking.
            if (booking.Status.Code != "confirmed")
                throw new InvalidOperationException($"Cannot cancel booking in status '{booking.Status.Code}'.");

            await RequireBookingStaffAsync(booking, requestingUserId, cancellationToken);
        }

        return await ChangeStatusAsync(booking, "cancelled", requestingUserId, cancellationToken);
    }

    public async Task<IReadOnlyList<BookingSummaryResponse>> GetByOrganizationAsync(
        Guid organizationId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var org = await _dbContext.Organizations
            .AsNoTracking()
            .Include(o => o.Employees)
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (org is null)
            throw new KeyNotFoundException($"Organization {organizationId} not found.");

        var hasAccess = OrganizationAccess.IsOwner(requestingUserId, org) ||
                        OrganizationAccess.IsEmployee(requestingUserId, organizationId, org.Employees);

        if (!hasAccess)
            throw new UnauthorizedAccessException("Access denied.");

        return await _dbContext.Bookings
            .AsNoTracking()
            .Where(b => b.OrganizationId == organizationId)
            .Include(b => b.Organization)
            .Include(b => b.Service)
            .Include(b => b.Employee)
            .Include(b => b.Status)
            .Include(b => b.Slot)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => ToSummary(b))
            .ToListAsync(cancellationToken);
    }

    public async Task<BookingResponse> ConfirmAsync(
        Guid bookingId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var booking = await LoadBookingForUpdateAsync(bookingId, cancellationToken);

        if (booking.Status.Code != "created")
            throw new InvalidOperationException($"Cannot confirm booking in status '{booking.Status.Code}'.");

        await RequireOrgAccessAsync(booking, requestingUserId, cancellationToken);

        return await ChangeStatusAsync(booking, "confirmed", requestingUserId, cancellationToken);
    }

    public async Task<BookingResponse> RejectAsync(
        Guid bookingId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var booking = await LoadBookingForUpdateAsync(bookingId, cancellationToken);

        if (booking.Status.Code != "created")
            throw new InvalidOperationException($"Cannot reject booking in status '{booking.Status.Code}'.");

        await RequireOrgAccessAsync(booking, requestingUserId, cancellationToken);

        return await ChangeStatusAsync(booking, "rejected", requestingUserId, cancellationToken);
    }

    public async Task<BookingResponse> CompleteAsync(
        Guid bookingId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var booking = await LoadBookingForUpdateAsync(bookingId, cancellationToken);

        if (booking.Status.Code != "confirmed")
            throw new InvalidOperationException($"Cannot complete booking in status '{booking.Status.Code}'.");

        await RequireOrgAccessAsync(booking, requestingUserId, cancellationToken);

        return await ChangeStatusAsync(booking, "completed", requestingUserId, cancellationToken);
    }

    public async Task<BookingQrResponse> GetQrAsync(
        Guid bookingId,
        Guid citizenId,
        CancellationToken cancellationToken = default)
    {
        var qrCode = await _dbContext.BookingQrCodes
            .AsNoTracking()
            .Include(q => q.Booking)
            .FirstOrDefaultAsync(q => q.BookingId == bookingId, cancellationToken);

        if (qrCode is null)
            throw new KeyNotFoundException($"QR code for booking {bookingId} not found.");

        if (qrCode.Booking.CitizenId != citizenId)
            throw new UnauthorizedAccessException("Access denied.");

        return new BookingQrResponse(bookingId, qrCode.Token);
    }

    public async Task<ScanQrResponse> ScanAsync(
        ScanQrRequest request,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var qrCode = await _dbContext.BookingQrCodes
            .Include(q => q.Booking)
                .ThenInclude(b => b.Service)
            .Include(q => q.Booking)
                .ThenInclude(b => b.Citizen)
            .Include(q => q.Booking)
                .ThenInclude(b => b.Status)
            .Include(q => q.Booking)
                .ThenInclude(b => b.Slot)
            .FirstOrDefaultAsync(q => q.Token == request.Token, cancellationToken);

        if (qrCode is null)
            throw new KeyNotFoundException("QR code not found.");

        if (qrCode.ExpiresAt.HasValue && qrCode.ExpiresAt.Value < DateTimeOffset.UtcNow)
            throw new InvalidOperationException("QR code has expired.");

        if (qrCode.UsedAt.HasValue)
            throw new InvalidOperationException("QR code has already been used.");

        var booking = qrCode.Booking;

        if (booking.Status.Code != "confirmed")
            throw new InvalidOperationException($"Cannot check in booking with status '{booking.Status.Code}'.");

        await RequireOrgAccessAsync(booking, requestingUserId, cancellationToken);

        var completedStatus = await _dbContext.BookingStatuses
            .AsNoTracking()
            .FirstAsync(s => s.Code == "completed", cancellationToken);

        var history = new BookingStatusHistory
        {
            Id = Guid.NewGuid(),
            BookingId = booking.Id,
            OldStatusId = booking.StatusId,
            NewStatusId = completedStatus.Id,
            ChangedById = requestingUserId,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.BookingStatusHistory.Add(history);

        qrCode.UsedAt = DateTimeOffset.UtcNow;
        booking.StatusId = completedStatus.Id;
        booking.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        await _notificationService.NotifyBookingStatusChangedAsync(
            booking.CitizenId, booking.Id, "completed",
            booking.Service.Name, booking.Slot?.StartAt, cancellationToken);

        return new ScanQrResponse(
            booking.Id,
            booking.Citizen.FirstName,
            booking.Citizen.LastName,
            booking.Service.Name,
            booking.Slot?.StartAt ?? booking.CreatedAt,
            booking.Slot?.EndAt ?? booking.CreatedAt,
            completedStatus.Code,
            completedStatus.Name);
    }

    private async Task<Booking> LoadBookingForUpdateAsync(Guid bookingId, CancellationToken cancellationToken)
    {
        var booking = await _dbContext.Bookings
            .Include(b => b.Organization)
            .Include(b => b.Service)
            .Include(b => b.Employee)
            .Include(b => b.Status)
            .Include(b => b.Slot)
            .FirstOrDefaultAsync(b => b.Id == bookingId, cancellationToken);

        if (booking is null)
            throw new KeyNotFoundException($"Booking {bookingId} not found.");

        return booking;
    }

    private async Task RequireOrgAccessAsync(Booking booking, Guid requestingUserId, CancellationToken cancellationToken)
    {
        var org = await _dbContext.Organizations
            .AsNoTracking()
            .Include(o => o.Employees)
            .FirstOrDefaultAsync(o => o.Id == booking.OrganizationId, cancellationToken);

        var hasAccess = org is not null &&
            (OrganizationAccess.IsOwner(requestingUserId, org) ||
             OrganizationAccess.IsEmployee(requestingUserId, booking.OrganizationId, org.Employees));

        if (!hasAccess)
            throw new UnauthorizedAccessException("Access denied.");
    }

    private async Task RequireBookingStaffAsync(Booking booking, Guid requestingUserId, CancellationToken cancellationToken)
    {
        var org = await _dbContext.Organizations
            .AsNoTracking()
            .Include(o => o.Employees)
            .FirstOrDefaultAsync(o => o.Id == booking.OrganizationId, cancellationToken);

        if (org is null)
            throw new UnauthorizedAccessException("Access denied.");

        var isOwner = OrganizationAccess.IsOwner(requestingUserId, org);
        var isBookingEmployee = booking.EmployeeId is not null &&
            org.Employees.Any(e => e.Id == booking.EmployeeId && e.UserId == requestingUserId);

        if (!isOwner && !isBookingEmployee)
            throw new UnauthorizedAccessException("Access denied.");
    }

    private async Task<BookingResponse> ChangeStatusAsync(
        Booking booking,
        string newStatusCode,
        Guid changedById,
        CancellationToken cancellationToken)
    {
        var newStatus = await _dbContext.BookingStatuses
            .AsNoTracking()
            .FirstAsync(s => s.Code == newStatusCode, cancellationToken);

        var history = new BookingStatusHistory
        {
            Id = Guid.NewGuid(),
            BookingId = booking.Id,
            OldStatusId = booking.StatusId,
            NewStatusId = newStatus.Id,
            ChangedById = changedById,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.BookingStatusHistory.Add(history);

        booking.StatusId = newStatus.Id;
        booking.Status = newStatus;
        booking.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        await _notificationService.NotifyBookingStatusChangedAsync(
            booking.CitizenId, booking.Id, newStatusCode,
            booking.Service?.Name ?? string.Empty, booking.Slot?.StartAt, cancellationToken);

        return ToResponse(booking);
    }

    private static string GenerateQrToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');

    private static BookingResponse ToResponse(Booking b) =>
        new(
            b.Id,
            b.OrganizationId,
            b.Organization?.Name ?? string.Empty,
            b.Organization?.City ?? string.Empty,
            b.Organization?.Address ?? string.Empty,
            b.ServiceId,
            b.Service?.Name ?? string.Empty,
            b.Service?.Price,
            b.EmployeeId,
            b.Employee?.FirstName,
            b.Employee?.LastName,
            b.CitizenId,
            b.Status?.Code ?? string.Empty,
            b.Status?.Name ?? string.Empty,
            b.Comment,
            b.Slot?.StartAt ?? b.CreatedAt,
            b.Slot?.EndAt ?? b.CreatedAt,
            b.CreatedAt);

    private static BookingSummaryResponse ToSummary(Booking b) =>
        new(
            b.Id,
            b.OrganizationId,
            b.Organization?.Name ?? string.Empty,
            b.ServiceId,
            b.Service?.Name ?? string.Empty,
            b.EmployeeId,
            b.Employee?.FirstName,
            b.Employee?.LastName,
            b.CitizenId,
            b.Status?.Code ?? string.Empty,
            b.Comment,
            b.Slot?.StartAt ?? b.CreatedAt,
            b.CreatedAt);

    private static string? NormalizeNullable(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
