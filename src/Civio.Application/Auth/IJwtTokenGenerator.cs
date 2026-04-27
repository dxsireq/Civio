using Civio.Domain.Entities;

namespace Civio.Application.Auth;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user, IReadOnlyCollection<string> roles);
}
