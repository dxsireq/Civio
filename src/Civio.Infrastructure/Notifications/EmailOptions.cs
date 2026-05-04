namespace Civio.Infrastructure.Notifications;

public sealed class EmailOptions
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string From { get; set; } = "noreply@civio.app";
    public bool EnableSsl { get; set; } = true;
}
