// NakitAkisDashboard.API/Program.cs - CORS FIX

using NakitAkisDashboard.API.Services;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// ===== SERILOG SETUP =====
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("Logs/app-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// ===== SERVICES =====
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Utc;
        options.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
    });

// Database Services
builder.Services.AddScoped<INakitAkisService, NakitAkisService>();
builder.Services.AddScoped<IExportService, ExportService>();

// Health Checks
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!);

// CORS - UPDATED FOR REACT WITH HTTPS
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "https://localhost:3000",
            "http://127.0.0.1:3000",
            "https://127.0.0.1:3000"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });

    // Development için daha geniş CORS
    options.AddPolicy("Development", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "Nakit Akış Dashboard API",
        Version = "v1",
        Description = "Clean React Dashboard API - No Grafana"
    });
});

var app = builder.Build();

// ===== PIPELINE =====
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Nakit Akış Dashboard API V1");
        c.RoutePrefix = "swagger";
    });

    // Development CORS
    app.UseCors("Development");
}
else
{
    // Production CORS
    app.UseCors("ReactApp");
}

// Database Connection Test
if (app.Environment.IsDevelopment())
{
    try
    {
        using var connection = new Npgsql.NpgsqlConnection(
            builder.Configuration.GetConnectionString("DefaultConnection"));
        await connection.OpenAsync();
        Log.Information("✅ PostgreSQL connection successful!");
        await connection.CloseAsync();
    }
    catch (Exception ex)
    {
        Log.Error("❌ PostgreSQL connection failed: {Error}", ex.Message);
    }
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

// Welcome Endpoint - UPDATED
app.MapGet("/", () => Results.Json(new
{
    message = "🚀 Nakit Akış Dashboard API",
    version = "v1.0",
    status = "healthy",
    timestamp = DateTime.UtcNow,
    endpoints = new
    {
        swagger = "/swagger",
        health = "/health",
        analysis = "/api/analysis",
        trends = "/api/trends",
        variables = "/api/variables",
        export = "/api/export"
    },
    cors = new
    {
        allowedOrigins = new[] { "http://localhost:3000", "https://localhost:3000" },
        development = app.Environment.IsDevelopment()
    }
}));

// Startup Logs
Log.Information("🚀 Nakit Akış Dashboard API Starting...");
Log.Information("📡 API Base URL: https://localhost:7289");
Log.Information("📖 Swagger UI: https://localhost:7289/swagger");
Log.Information("❤️ Health Check: https://localhost:7289/health");
Log.Information("🗄️ Database: PostgreSQL");
Log.Information("⚛️ CORS: React App (localhost:3000) + Development mode");
Log.Information("⚡ Ready for React Dashboard!");

app.Run();