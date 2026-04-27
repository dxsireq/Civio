namespace Civio.Domain.Entities;

public sealed class Role
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = [];
}
