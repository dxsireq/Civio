using Civio.Contracts.WorkDays;

namespace Civio.Application.Schedule;

public interface IWorkDayService
{
    Task<WorkDayResponse> CreateAsync(
        Guid employeeId,
        Guid requestingUserId,
        CreateWorkDayRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WorkDayResponse>> GetByEmployeeAsync(
        Guid employeeId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default);

    Task<WorkDayResponse> UpdateAsync(
        Guid workDayId,
        Guid employeeId,
        Guid requestingUserId,
        UpdateWorkDayRequest request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid workDayId,
        Guid employeeId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default);
}
