using Civio.Application.Auth;
using Civio.Contracts.Common;
using Microsoft.AspNetCore.Diagnostics;

namespace Civio.Api.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, code) = exception switch
        {
            EmailNotVerifiedException => (StatusCodes.Status403Forbidden, "email_not_verified"),
            ArgumentException => (StatusCodes.Status400BadRequest, (string?)null),
            UnauthorizedAccessException => (StatusCodes.Status403Forbidden, null),
            KeyNotFoundException => (StatusCodes.Status404NotFound, null),
            InvalidOperationException => (StatusCodes.Status409Conflict, null),
            _ => (StatusCodes.Status500InternalServerError, null)
        };

        httpContext.Response.StatusCode = statusCode;

        await httpContext.Response.WriteAsJsonAsync(
            new ErrorResponse(exception.Message, statusCode, code),
            cancellationToken);

        return true;
    }
}
