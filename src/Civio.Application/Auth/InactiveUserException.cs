namespace Civio.Application.Auth;

public sealed class InactiveUserException : Exception
{
    public InactiveUserException()
        : base("User account is inactive.") { }
}
