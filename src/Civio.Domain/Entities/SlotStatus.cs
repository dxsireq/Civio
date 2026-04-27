namespace Civio.Domain.Entities;

public sealed class SlotStatus
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    public ICollection<BookingSlot> BookingSlots { get; set; } = [];
}
