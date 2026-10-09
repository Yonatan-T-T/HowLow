using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using UniqueLow.Api.Data;
using UniqueLow.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Add DbContext with SQLite
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=uniquelow.db";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

// 2. Register application services
builder.Services.AddScoped<IAuctionService, AuctionService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();

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
