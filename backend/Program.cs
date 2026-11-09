using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using UniqueLow.Api.Data;
using UniqueLow.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Add DbContext (PostgreSQL in production/cloud, SQLite fallback locally)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=uniquelow.db";

// Helper to normalize postgres:// or postgresql:// URI into standard Npgsql connection string
static string NormalizePostgresConnectionString(string connStr)
{
    if (connStr.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
        connStr.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        var uri = new Uri(connStr);
        var userInfo = uri.UserInfo.Split(':');
        var user = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
        var pass = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
        var db = uri.AbsolutePath.TrimStart('/');
        var port = uri.Port > 0 ? uri.Port : 5432;
        return $"Host={uri.Host};Port={port};Database={db};Username={user};Password={pass};SSL Mode=Require;Trust Server Certificate=true;";
    }
    return connStr;
}

bool isPostgres = connectionString.StartsWith("Host=", StringComparison.OrdinalIgnoreCase) ||
                  connectionString.StartsWith("Server=", StringComparison.OrdinalIgnoreCase) ||
                  connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
                  connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
                  connectionString.Contains("neon.tech", StringComparison.OrdinalIgnoreCase);

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (isPostgres)
    {
        var formattedConnStr = NormalizePostgresConnectionString(connectionString);
        options.UseNpgsql(formattedConnStr);
    }
    else
    {
        options.UseSqlite(connectionString);
    }
});

// 2. Register application services
builder.Services.AddHttpClient();
builder.Services.AddScoped<IAuctionService, AuctionService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IChapaService, ChapaService>();

// 3. Controllers and JSON serialization
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Serialize enums as strings for clean frontend consumption
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// 4. Configure CORS for frontend access
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 5. Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Unique Low API",
        Version = "v1",
        Description = "Lowest Unique Bid Auction Platform API"
    });
});

var app = builder.Build();

// Seed database on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbInitializer.SeedAsync(context);
}

// Enable Swagger documentation for testing
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Unique Low API v1");
    c.RoutePrefix = "swagger";
});

app.UseRouting();
app.UseCors("AllowAll");

// Disable HTTPS redirection in local dev if running plain HTTP
// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
