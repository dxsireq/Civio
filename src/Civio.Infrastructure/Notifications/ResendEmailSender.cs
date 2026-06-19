using System.Net.Http.Json;
using Civio.Application.Notifications;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Civio.Infrastructure.Notifications;

/// <summary>
/// Sends email via the Resend HTTP API (https://api.resend.com) over port 443.
/// Replaces SMTP in prod: the VPS blocks all outbound SMTP ports (25/465/587/2525).
/// </summary>
public sealed class ResendEmailSender : IEmailSender
{
    private readonly HttpClient _httpClient;
    private readonly EmailOptions _options;
    private readonly ILogger<ResendEmailSender> _logger;

    public ResendEmailSender(
        HttpClient httpClient,
        IOptions<EmailOptions> options,
        ILogger<ResendEmailSender> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey) ||
            string.IsNullOrWhiteSpace(_options.From))
        {
            _logger.LogInformation("Email API not configured. Skipping send to {To}: {Subject}", to, subject);
            return;
        }

        var payload = new
        {
            from = _options.From,
            to = new[] { to },
            subject,
            text = body
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "emails")
        {
            Content = JsonContent.Create(payload)
        };
        request.Headers.Add("Authorization", $"Bearer {_options.ApiKey}");

        using var response = await _httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException(
                $"Resend API returned {(int)response.StatusCode}: {error}");
        }
    }
}
