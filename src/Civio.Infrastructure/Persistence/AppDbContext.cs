using Civio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Civio.Infrastructure.Persistence;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();

    public DbSet<OrganizationStatus> OrganizationStatuses => Set<OrganizationStatus>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<OrganizationModerationHistory> OrganizationModerationHistory => Set<OrganizationModerationHistory>();

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<EmployeeService> EmployeeServices => Set<EmployeeService>();

    public DbSet<SlotStatus> SlotStatuses => Set<SlotStatus>();
    public DbSet<ScheduleTemplate> ScheduleTemplates => Set<ScheduleTemplate>();
    public DbSet<WorkDay> WorkDays => Set<WorkDay>();
    public DbSet<BookingSlot> BookingSlots => Set<BookingSlot>();

    public DbSet<BookingStatus> BookingStatuses => Set<BookingStatus>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<BookingStatusHistory> BookingStatusHistory => Set<BookingStatusHistory>();
    public DbSet<BookingQrCode> BookingQrCodes => Set<BookingQrCode>();

    public DbSet<NotificationType> NotificationTypes => Set<NotificationType>();
    public DbSet<NotificationChannel> NotificationChannels => Set<NotificationChannel>();
    public DbSet<NotificationStatus> NotificationStatuses => Set<NotificationStatus>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<DevicePushToken> DevicePushTokens => Set<DevicePushToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
