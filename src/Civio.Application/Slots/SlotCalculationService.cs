using Civio.Domain.Entities;

namespace Civio.Application.Slots;

public sealed class SlotCalculationService
{
    public IReadOnlyList<TimeSlot> GetAvailableSlots(
        WorkDay workDay,
        IEnumerable<BookingSlot> existingSlots,
        int durationMinutes)
    {
        var slots = new List<TimeSlot>();
        var currentTs = workDay.StartTime.ToTimeSpan();
        var endTs = workDay.EndTime.ToTimeSpan();
        var durationTs = TimeSpan.FromMinutes(durationMinutes);

        while (currentTs + durationTs <= endTs)
        {
            var slotEndTs = currentTs + durationTs;

            if (workDay.BreakStart.HasValue && workDay.BreakEnd.HasValue)
            {
                var breakStartTs = workDay.BreakStart.Value.ToTimeSpan();
                var breakEndTs = workDay.BreakEnd.Value.ToTimeSpan();

                if (currentTs < breakEndTs && slotEndTs > breakStartTs)
                {
                    currentTs = breakEndTs;
                    continue;
                }
            }

            var isFree = !existingSlots.Any(s =>
                s.StartAt.TimeOfDay < slotEndTs && s.EndAt.TimeOfDay > currentTs);

            if (isFree)
                slots.Add(new TimeSlot(
                    TimeOnly.FromTimeSpan(currentTs),
                    TimeOnly.FromTimeSpan(slotEndTs)));

            currentTs += durationTs;
        }

        return slots;
    }
}
