using System.ComponentModel.DataAnnotations;

namespace Civio.Contracts.Bookings;

public record ScanQrRequest([Required] string Token);
