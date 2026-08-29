using KnowledgeFoundry.AIPlatform;
using KnowledgeFoundry.Api.Endpoints.AiPlatform;
using KnowledgeFoundry.Api.Endpoints.ContextPacks;
using KnowledgeFoundry.Api.Endpoints.Lessons;
using KnowledgeFoundry.Api.Endpoints.PromptTemplates;
using KnowledgeFoundry.Api.Endpoints.Settings;
using KnowledgeFoundry.Api.Middleware;
using KnowledgeFoundry.Api.Swagger;
using KnowledgeFoundry.Application.DependencyInjection;
using KnowledgeFoundry.Infrastructure;
using KnowledgeFoundry.Infrastructure.BackgroundProcessing;
using KnowledgeFoundry.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApplication()
    .AddAIPlatform()
    .AddInfrastructure(builder.Configuration);

// 1. Worker registration
builder.Services.AddHostedService<LessonGenerationWorker>();

// 2. JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var authority = builder.Configuration["Authentication:Clerk:Authority"];
        options.Authority = authority;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = authority,
            ValidateAudience = false,
            ValidateLifetime = true,
            NameClaimType = ClaimTypes.NameIdentifier
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>();
        if (allowedOrigins != null && allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            Console.WriteLine("WARNING: No CORS AllowedOrigins found in configuration!");
        }
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.OperationFilter<CorrelationIdHeaderParameter>();

    // 3. Swagger JWT definition
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    //c.AddSecurityRequirement(new OpenApiSecurityRequirement
    //{
    //    {
    //        new OpenApiSecurityScheme
    //        {
    //            Reference = new OpenApiReference
    //            {
    //                Type = ReferenceType.SecurityScheme,
    //                Id = "Bearer"
    //            }
    //        },
    //        new List<string>()
    //    }
    //});
});

var app = builder.Build();

app.UseMiddleware<CorrelationIdMiddleware>();

app.UseExceptionHandler();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Knowledge Foundry API v1");
    c.RoutePrefix = string.Empty;
    c.EnableTryItOutByDefault();
});

// app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

// 4. Auth Middlewares in required sequence
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/health", () => Results.Ok(new { status = "Healthy", timestamp = DateTime.UtcNow }))
   .WithTags("System")
   .ExcludeFromDescription();

// Feature endpoints
app.MapConfigEndpoints();
app.MapPromptTemplateEndpoints();
app.MapContextPackEndpoints();
app.MapLessonEndpoints();
app.MapAiModelEndpoints();

// Database migration & seeding
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var seeder = services.GetRequiredService<IDatabaseSeeder>();
        await seeder.SeedAsync();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
    }
}

app.Run();
