using Civio.Contracts.ScheduleTemplates;

namespace Civio.Application.Schedule;

public interface IScheduleTemplateService
{
    Task<ScheduleTemplateResponse> CreateAsync(
        Guid employeeId,
        Guid requestingUserId,
        CreateScheduleTemplateRequest request,
        CancellationToken cancellationToken = default);
}
