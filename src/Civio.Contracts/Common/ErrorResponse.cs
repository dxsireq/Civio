namespace Civio.Contracts.Common;

public record ErrorResponse(string Error, int StatusCode, string? Code = null);
