namespace Civio.Domain.Entities;

public sealed class DevicePushToken
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Token { get; set; } = string.Empty;
    public string? Platform { get; set; }

    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
