using Civio.Application.Employees;
using Civio.Application.Organizations;
using Civio.Application.Schedule;
using Civio.Application.Services;
using Civio.Infrastructure.Employees;
using Civio.Infrastructure.Organizations;
using Civio.Infrastructure.Persistence;
using Civio.Infrastructure.Schedule;
using Civio.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Civio.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"));
        });

        services.AddScoped<IOrganizationService, OrganizationService>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<IServiceService, ServiceService>();
        services.AddScoped<IWorkDayService, WorkDayService>();
        services.AddScoped<IScheduleTemplateService, ScheduleTemplateService>();

        return services;
    }
}
