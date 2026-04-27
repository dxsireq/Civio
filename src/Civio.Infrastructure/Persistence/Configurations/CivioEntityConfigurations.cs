using Civio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Civio.Infrastructure.Persistence.Configurations;

public sealed class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("roles");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(50).IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();

        builder.HasIndex(x => x.Name).IsUnique();
    }
}

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
        builder.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(30);
        builder.Property(x => x.PasswordHash).HasColumnName("password_hash").IsRequired();
        builder.Property(x => x.FirstName).HasColumnName("first_name").HasMaxLength(100).IsRequired();
        builder.Property(x => x.LastName).HasColumnName("last_name").HasMaxLength(100).IsRequired();
        builder.Property(x => x.MiddleName).HasColumnName("middle_name").HasMaxLength(100);
        builder.Property(x => x.IsActive).HasColumnName("is_active").HasDefaultValue(true).IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.Email).IsUnique();
    }
}

public sealed class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("user_roles");

        builder.HasKey(x => new { x.UserId, x.RoleId });

        builder.Property(x => x.UserId).HasColumnName("user_id");
        builder.Property(x => x.RoleId).HasColumnName("role_id");

        builder.HasOne(x => x.User)
            .WithMany(x => x.UserRoles)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Role)
            .WithMany(x => x.UserRoles)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class OrganizationStatusConfiguration : IEntityTypeConfiguration<OrganizationStatus>
{
    public void Configure(EntityTypeBuilder<OrganizationStatus> builder)
    {
        builder.ToTable("organization_statuses");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.Code).HasColumnName("code").HasMaxLength(50).IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();

        builder.HasIndex(x => x.Code).IsUnique();
    }
}

public sealed class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
{
    public void Configure(EntityTypeBuilder<Organization> builder)
    {
        builder.ToTable("organizations");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(255).IsRequired();
        builder.Property(x => x.Description).HasColumnName("description");
        builder.Property(x => x.Email).HasColumnName("email").HasMaxLength(255);
        builder.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(30);
        builder.Property(x => x.Website).HasColumnName("website").HasMaxLength(255);
        builder.Property(x => x.LegalName).HasColumnName("legal_name").HasMaxLength(255);
        builder.Property(x => x.Inn).HasColumnName("inn").HasMaxLength(20);
        builder.Property(x => x.StatusId).HasColumnName("status_id");
        builder.Property(x => x.OwnerUserId).HasColumnName("owner_user_id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.Status)
            .WithMany(x => x.Organizations)
            .HasForeignKey(x => x.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.OwnerUser)
            .WithMany(x => x.OwnedOrganizations)
            .HasForeignKey(x => x.OwnerUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.StatusId);
        builder.HasIndex(x => x.OwnerUserId);
    }
}

public sealed class OrganizationModerationHistoryConfiguration : IEntityTypeConfiguration<OrganizationModerationHistory>
{
    public void Configure(EntityTypeBuilder<OrganizationModerationHistory> builder)
    {
        builder.ToTable("organization_moderation_history");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.OrganizationId).HasColumnName("organization_id");
        builder.Property(x => x.ModeratorId).HasColumnName("moderator_id");
        builder.Property(x => x.OldStatusId).HasColumnName("old_status_id");
        builder.Property(x => x.NewStatusId).HasColumnName("new_status_id");
        builder.Property(x => x.Comment).HasColumnName("comment");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();

        builder.HasOne(x => x.Organization)
            .WithMany()
            .HasForeignKey(x => x.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Moderator)
            .WithMany()
            .HasForeignKey(x => x.ModeratorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.OldStatus)
            .WithMany()
            .HasForeignKey(x => x.OldStatusId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.NewStatus)
            .WithMany()
            .HasForeignKey(x => x.NewStatusId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class BranchConfiguration : IEntityTypeConfiguration<Branch>
{
    public void Configure(EntityTypeBuilder<Branch> builder)
    {
        builder.ToTable("branches");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.OrganizationId).HasColumnName("organization_id");
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(255).IsRequired();
        builder.Property(x => x.City).HasColumnName("city").HasMaxLength(100).IsRequired();
        builder.Property(x => x.Address).HasColumnName("address").IsRequired();
        builder.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(30);
        builder.Property(x => x.IsActive).HasColumnName("is_active").HasDefaultValue(true).IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.Organization)
            .WithMany(x => x.Branches)
            .HasForeignKey(x => x.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.OrganizationId);
    }
}

public sealed class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("employees");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.UserId).HasColumnName("user_id");
        builder.Property(x => x.OrganizationId).HasColumnName("organization_id");
        builder.Property(x => x.BranchId).HasColumnName("branch_id");
        builder.Property(x => x.FirstName).HasColumnName("first_name").HasMaxLength(100).IsRequired();
        builder.Property(x => x.LastName).HasColumnName("last_name").HasMaxLength(100).IsRequired();
        builder.Property(x => x.MiddleName).HasColumnName("middle_name").HasMaxLength(100);
        builder.Property(x => x.Position).HasColumnName("position").HasMaxLength(150);
        builder.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(30);
        builder.Property(x => x.Email).HasColumnName("email").HasMaxLength(255);
        builder.Property(x => x.IsActive).HasColumnName("is_active").HasDefaultValue(true).IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.User)
            .WithMany(x => x.EmployeeProfiles)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Organization)
            .WithMany(x => x.Employees)
            .HasForeignKey(x => x.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Branch)
            .WithMany(x => x.Employees)
            .HasForeignKey(x => x.BranchId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.OrganizationId);
        builder.HasIndex(x => x.BranchId);
    }
}

public sealed class ServiceCategoryConfiguration : IEntityTypeConfiguration<ServiceCategory>
{
    public void Configure(EntityTypeBuilder<ServiceCategory> builder)
    {
        builder.ToTable("service_categories");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.OrganizationId).HasColumnName("organization_id");
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(150).IsRequired();
        builder.Property(x => x.Description).HasColumnName("description");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();

        builder.HasOne(x => x.Organization)
            .WithMany(x => x.ServiceCategories)
            .HasForeignKey(x => x.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ServiceConfiguration : IEntityTypeConfiguration<Service>
{
    public void Configure(EntityTypeBuilder<Service> builder)
    {
        builder.ToTable("services");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.OrganizationId).HasColumnName("organization_id");
        builder.Property(x => x.CategoryId).HasColumnName("category_id");
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(255).IsRequired();
        builder.Property(x => x.Description).HasColumnName("description");
        builder.Property(x => x.DurationMinutes).HasColumnName("duration_minutes").IsRequired();
        builder.Property(x => x.Price).HasColumnName("price").HasPrecision(10, 2);
        builder.Property(x => x.IsActive).HasColumnName("is_active").HasDefaultValue(true).IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.Organization)
            .WithMany(x => x.Services)
            .HasForeignKey(x => x.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Category)
            .WithMany(x => x.Services)
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.OrganizationId);
        builder.HasIndex(x => x.CategoryId);
    }
}

public sealed class EmployeeServiceConfiguration : IEntityTypeConfiguration<EmployeeService>
{
    public void Configure(EntityTypeBuilder<EmployeeService> builder)
    {
        builder.ToTable("employee_services");

        builder.HasKey(x => new { x.EmployeeId, x.ServiceId });

        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.ServiceId).HasColumnName("service_id");

        builder.HasOne(x => x.Employee)
            .WithMany(x => x.EmployeeServices)
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Service)
            .WithMany(x => x.EmployeeServices)
            .HasForeignKey(x => x.ServiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class SlotStatusConfiguration : IEntityTypeConfiguration<SlotStatus>
{
    public void Configure(EntityTypeBuilder<SlotStatus> builder)
    {
        builder.ToTable("slot_statuses");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.Code).HasColumnName("code").HasMaxLength(50).IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();

        builder.HasIndex(x => x.Code).IsUnique();
    }
}

public sealed class ScheduleTemplateConfiguration : IEntityTypeConfiguration<ScheduleTemplate>
{
    public void Configure(EntityTypeBuilder<ScheduleTemplate> builder)
    {
        builder.ToTable("schedule_templates");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.DayOfWeek).HasColumnName("day_of_week");
        builder.Property(x => x.StartTime).HasColumnName("start_time");
        builder.Property(x => x.EndTime).HasColumnName("end_time");
        builder.Property(x => x.BreakStart).HasColumnName("break_start");
        builder.Property(x => x.BreakEnd).HasColumnName("break_end");
        builder.Property(x => x.IsActive).HasColumnName("is_active").HasDefaultValue(true).IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();

        builder.HasOne(x => x.Employee)
            .WithMany(x => x.ScheduleTemplates)
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.ToTable(t =>
        {
            t.HasCheckConstraint("ck_schedule_templates_day_of_week", "day_of_week BETWEEN 1 AND 7");
            t.HasCheckConstraint("ck_schedule_templates_start_before_end", "start_time < end_time");
            t.HasCheckConstraint(
                "ck_schedule_templates_break_valid",
                "break_start IS NULL OR break_end IS NULL OR break_start < break_end");
        });
    }
}

public sealed class WorkDayConfiguration : IEntityTypeConfiguration<WorkDay>
{
    public void Configure(EntityTypeBuilder<WorkDay> builder)
    {
        builder.ToTable("work_days");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.WorkDate).HasColumnName("work_date");
        builder.Property(x => x.StartTime).HasColumnName("start_time");
        builder.Property(x => x.EndTime).HasColumnName("end_time");
        builder.Property(x => x.BreakStart).HasColumnName("break_start");
        builder.Property(x => x.BreakEnd).HasColumnName("break_end");
        builder.Property(x => x.IsWorking).HasColumnName("is_working").HasDefaultValue(true).IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.Employee)
            .WithMany(x => x.WorkDays)
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.EmployeeId, x.WorkDate })
            .IsUnique();

        builder.ToTable(t =>
        {
            t.HasCheckConstraint("ck_work_days_start_before_end", "start_time < end_time");
            t.HasCheckConstraint(
                "ck_work_days_break_valid",
                "break_start IS NULL OR break_end IS NULL OR break_start < break_end");
        });
    }
}

public sealed class BookingSlotConfiguration : IEntityTypeConfiguration<BookingSlot>
{
    public void Configure(EntityTypeBuilder<BookingSlot> builder)
    {
        builder.ToTable("booking_slots");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.ServiceId).HasColumnName("service_id");
        builder.Property(x => x.WorkDayId).HasColumnName("work_day_id");
        builder.Property(x => x.StatusId).HasColumnName("status_id");
        builder.Property(x => x.StartAt).HasColumnName("start_at");
        builder.Property(x => x.EndAt).HasColumnName("end_at");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();

        builder.HasOne(x => x.Employee)
            .WithMany(x => x.BookingSlots)
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Service)
            .WithMany(x => x.BookingSlots)
            .HasForeignKey(x => x.ServiceId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.WorkDay)
            .WithMany(x => x.BookingSlots)
            .HasForeignKey(x => x.WorkDayId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Status)
            .WithMany(x => x.BookingSlots)
            .HasForeignKey(x => x.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.EmployeeId, x.StartAt, x.EndAt })
            .IsUnique();

        builder.HasIndex(x => new { x.EmployeeId, x.StartAt });
        builder.HasIndex(x => x.StatusId);
        builder.HasIndex(x => x.ServiceId);

        builder.ToTable(t =>
        {
            t.HasCheckConstraint("ck_booking_slots_start_before_end", "start_at < end_at");
        });
    }
}

public sealed class BookingStatusConfiguration : IEntityTypeConfiguration<BookingStatus>
{
    public void Configure(EntityTypeBuilder<BookingStatus> builder)
    {
        builder.ToTable("booking_statuses");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.Code).HasColumnName("code").HasMaxLength(50).IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();

        builder.HasIndex(x => x.Code).IsUnique();
    }
}

public sealed class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("bookings");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.CitizenId).HasColumnName("citizen_id");
        builder.Property(x => x.OrganizationId).HasColumnName("organization_id");
        builder.Property(x => x.BranchId).HasColumnName("branch_id");
        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.ServiceId).HasColumnName("service_id");
        builder.Property(x => x.SlotId).HasColumnName("slot_id");
        builder.Property(x => x.StatusId).HasColumnName("status_id");
        builder.Property(x => x.Comment).HasColumnName("comment");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.Citizen)
            .WithMany(x => x.Bookings)
            .HasForeignKey(x => x.CitizenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Organization)
            .WithMany(x => x.Bookings)
            .HasForeignKey(x => x.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Branch)
            .WithMany(x => x.Bookings)
            .HasForeignKey(x => x.BranchId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Employee)
            .WithMany(x => x.Bookings)
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Service)
            .WithMany(x => x.Bookings)
            .HasForeignKey(x => x.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Slot)
            .WithMany(x => x.Bookings)
            .HasForeignKey(x => x.SlotId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Status)
            .WithMany(x => x.Bookings)
            .HasForeignKey(x => x.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.CitizenId);
        builder.HasIndex(x => x.OrganizationId);
        builder.HasIndex(x => x.EmployeeId);
        builder.HasIndex(x => x.ServiceId);
        builder.HasIndex(x => x.StatusId);
        builder.HasIndex(x => x.SlotId);
    }
}

public sealed class BookingStatusHistoryConfiguration : IEntityTypeConfiguration<BookingStatusHistory>
{
    public void Configure(EntityTypeBuilder<BookingStatusHistory> builder)
    {
        builder.ToTable("booking_status_history");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.BookingId).HasColumnName("booking_id");
        builder.Property(x => x.OldStatusId).HasColumnName("old_status_id");
        builder.Property(x => x.NewStatusId).HasColumnName("new_status_id");
        builder.Property(x => x.ChangedById).HasColumnName("changed_by_id");
        builder.Property(x => x.Comment).HasColumnName("comment");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();

        builder.HasOne(x => x.Booking)
            .WithMany(x => x.StatusHistory)
            .HasForeignKey(x => x.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.OldStatus)
            .WithMany()
            .HasForeignKey(x => x.OldStatusId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.NewStatus)
            .WithMany()
            .HasForeignKey(x => x.NewStatusId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ChangedBy)
            .WithMany()
            .HasForeignKey(x => x.ChangedById)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class BookingQrCodeConfiguration : IEntityTypeConfiguration<BookingQrCode>
{
    public void Configure(EntityTypeBuilder<BookingQrCode> builder)
    {
        builder.ToTable("booking_qr_codes");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.BookingId).HasColumnName("booking_id");
        builder.Property(x => x.Token).HasColumnName("token").HasMaxLength(255).IsRequired();
        builder.Property(x => x.ExpiresAt).HasColumnName("expires_at");
        builder.Property(x => x.UsedAt).HasColumnName("used_at");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();

        builder.HasOne(x => x.Booking)
            .WithOne(x => x.QrCode)
            .HasForeignKey<BookingQrCode>(x => x.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.BookingId).IsUnique();
        builder.HasIndex(x => x.Token).IsUnique();
    }
}

public sealed class NotificationTypeConfiguration : IEntityTypeConfiguration<NotificationType>
{
    public void Configure(EntityTypeBuilder<NotificationType> builder)
    {
        builder.ToTable("notification_types");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.Code).HasColumnName("code").HasMaxLength(50).IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();

        builder.HasIndex(x => x.Code).IsUnique();
    }
}

public sealed class NotificationChannelConfiguration : IEntityTypeConfiguration<NotificationChannel>
{
    public void Configure(EntityTypeBuilder<NotificationChannel> builder)
    {
        builder.ToTable("notification_channels");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.Code).HasColumnName("code").HasMaxLength(50).IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();

        builder.HasIndex(x => x.Code).IsUnique();
    }
}

public sealed class NotificationStatusConfiguration : IEntityTypeConfiguration<NotificationStatus>
{
    public void Configure(EntityTypeBuilder<NotificationStatus> builder)
    {
        builder.ToTable("notification_statuses");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.Code).HasColumnName("code").HasMaxLength(50).IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();

        builder.HasIndex(x => x.Code).IsUnique();
    }
}

public sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.UserId).HasColumnName("user_id");
        builder.Property(x => x.BookingId).HasColumnName("booking_id");
        builder.Property(x => x.TypeId).HasColumnName("type_id");
        builder.Property(x => x.ChannelId).HasColumnName("channel_id");
        builder.Property(x => x.StatusId).HasColumnName("status_id");
        builder.Property(x => x.Title).HasColumnName("title").HasMaxLength(255).IsRequired();
        builder.Property(x => x.Message).HasColumnName("message").IsRequired();
        builder.Property(x => x.ErrorMessage).HasColumnName("error_message");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();
        builder.Property(x => x.SentAt).HasColumnName("sent_at");

        builder.HasOne(x => x.User)
            .WithMany(x => x.Notifications)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Booking)
            .WithMany(x => x.Notifications)
            .HasForeignKey(x => x.BookingId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.Type)
            .WithMany()
            .HasForeignKey(x => x.TypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Channel)
            .WithMany()
            .HasForeignKey(x => x.ChannelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Status)
            .WithMany()
            .HasForeignKey(x => x.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.BookingId);
    }
}

public sealed class DevicePushTokenConfiguration : IEntityTypeConfiguration<DevicePushToken>
{
    public void Configure(EntityTypeBuilder<DevicePushToken> builder)
    {
        builder.ToTable("device_push_tokens");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
        builder.Property(x => x.UserId).HasColumnName("user_id");
        builder.Property(x => x.Token).HasColumnName("token").IsRequired();
        builder.Property(x => x.Platform).HasColumnName("platform").HasMaxLength(50);
        builder.Property(x => x.IsActive).HasColumnName("is_active").HasDefaultValue(true).IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.User)
            .WithMany(x => x.DevicePushTokens)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.Token).IsUnique();
        builder.HasIndex(x => x.UserId);
    }
}
