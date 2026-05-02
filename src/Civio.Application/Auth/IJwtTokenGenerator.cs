using Civio.Domain.Entities;

namespace Civio.Application.Auth;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user, IReadOnlyCollection<string> roles);
    string GenerateBookingQrToken(Guid bookingId, Guid citizenId, DateTimeOffset expiresAt);
}
