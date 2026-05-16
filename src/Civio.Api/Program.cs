using Civio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;
using Civio.Application.Auth;
using Civio.Contracts.Auth;
using Civio.Infrastructure.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Civio.Api.Endpoints;

using Civio.Api.Middleware;
using Civio.Infrastructure;


DotNetEnv.Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    const string securitySchemeName = "bearer";

    options.AddSecurityDefinition(securitySchemeName, new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme."
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference(securitySchemeName, document)] = []
    });
});
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.Configure<JwtOptions>(
    builder.Configuration.GetSection("Jwt"));

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

var jwtOptions = builder.Configuration
    .GetSection("Jwt")
    .Get<JwtOptions>()!;

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,

            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtOptions.Secret)),

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
        options.MapInboundClaims = true;
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("PlatformAdmin", policy => policy.RequireRole("PlatformAdmin"));
});
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddValidation();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseExceptionHandler();

//app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();


app.MapGet("/health/db", async (AppDbContext db) =>
{
    var canConnect = await db.Database.CanConnectAsync();

    var roles = await db.Roles
        .OrderBy(x => x.Name)
        .Select(x => x.Name)
        .ToListAsync();

    return Results.Ok(new
    {
        canConnect,
        roles
    });
});

var authGroup = app.MapGroup("/api/auth")
    .WithTags("Auth");

authGroup.MapPost("/register", async (
    RegisterRequest request,
    IAuthService authService,
    CancellationToken cancellationToken) =>
{
    var response = await authService.RegisterAsync(request, cancellationToken);
    return Results.Ok(response);
});

authGroup.MapPost("/login", async (
    LoginRequest request,
    IAuthService authService,
    CancellationToken cancellationToken) =>
{
    var response = await authService.LoginAsync(request, cancellationToken);
    return Results.Ok(response);
});

authGroup.MapGet("/me", async (
    ClaimsPrincipal user,
    IAuthService authService,
    CancellationToken cancellationToken) =>
{
    var userIdRaw = user.FindFirstValue(ClaimTypes.NameIdentifier);

    if (!Guid.TryParse(userIdRaw, out var userId))
        return Results.Unauthorized();

    var response = await authService.GetCurrentUserAsync(userId, cancellationToken);
    return Results.Ok(response);
})
.RequireAuthorization();

app.MapOrganizationEndpoints();
app.MapEmployeeEndpoints();
app.MapServiceEndpoints();
app.MapWorkDayEndpoints();
app.MapScheduleTemplateEndpoints();
app.MapSlotsEndpoints();
app.MapBookingEndpoints();
app.MapNotificationEndpoints();
app.MapAdminEndpoints();
app.MapAdminUserEndpoints();

app.UseSwagger();
app.UseSwaggerUI();
app.Run();
