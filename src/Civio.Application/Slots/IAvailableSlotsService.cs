using Civio.Contracts.Slots;

namespace Civio.Application.Slots;

public interface IAvailableSlotsService
{
    Task<IReadOnlyList<AvailableSlotResponse>> GetAvailableSlotsAsync(
        Guid organizationId,
        Guid serviceId,
        DateOnly date,
        CancellationToken cancellationToken = default);
}
