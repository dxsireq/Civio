namespace Civio.Infrastructure.Notifications;

public sealed class EmailOptions
{
    // HTTP API (Resend) — used in prod. VPS blocks outbound SMTP ports.
    public string ApiKey { get; set; } = string.Empty;

    // Sender address. Resend requires a verified domain, or use onboarding@resend.dev for testing.
    public string From { get; set; } = "noreply@civio.app";
}
