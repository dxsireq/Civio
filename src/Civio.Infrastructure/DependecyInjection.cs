using Civio.Application.Admin;
using Civio.Application.Bookings;
using Civio.Application.Employees;
using Civio.Application.Notifications;
using Civio.Application.Organizations;
using Civio.Application.Schedule;
using Civio.Application.Services;
using Civio.Application.Slots;
using Civio.Infrastructure.Admin;
using Civio.Infrastructure.Bookings;
using Civio.Infrastructure.Employees;
using Civio.Infrastructure.Notifications;
using Civio.Infrastructure.Organizations;
using Civio.Infrastructure.Persistence;
using Civio.Infrastructure.Schedule;
using Civio.Infrastructure.Services;
using Civio.Infrastructure.Slots;
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

        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IAdminUserService, AdminUserService>();
        services.AddScoped<IActivityLogService, ActivityLogService>();

        services.Configure<EmailOptions>(configuration.GetSection("Email"));
        services.AddScoped<IEmailSender, SmtpEmailSender>();
        services.AddScoped<INotificationService, NotificationService>();

        services.AddScoped<IOrganizationService, OrganizationService>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<IServiceService, ServiceService>();
        services.AddScoped<IWorkDayService, WorkDayService>();
        services.AddScoped<IScheduleTemplateService, ScheduleTemplateService>();
        services.AddScoped<SlotCalculationService>();
        services.AddScoped<IAvailableSlotsService, AvailableSlotsService>();
        services.AddScoped<IBookingService, BookingService>();

        return services;
    }
}
