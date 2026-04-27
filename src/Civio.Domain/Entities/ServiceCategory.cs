namespace Civio.Domain.Entities;

public sealed class ServiceCategory
{
    public Guid Id { get; set; }

    public Guid? OrganizationId { get; set; }
    public Organization? Organization { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<Service> Services { get; set; } = [];
}
