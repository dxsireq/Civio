namespace Civio.Application.Auth;

public sealed class EmailNotVerifiedException : Exception
{
    public EmailNotVerifiedException()
        : base("Email address is not verified.") { }
}
