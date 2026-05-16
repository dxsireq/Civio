namespace Civio.Contracts.Admin;

public record ActivityLogItemDto(
    Guid Id,
    DateTimeOffset OccurredAt,
    string EventType,
    string EntityType,
    Guid EntityId,
    string? EntityName,
    Guid? ActorId,
    string? ActorEmail,
    string? ActorFullName,
    string? OldValue,
    string? NewValue,
    string? Comment);
