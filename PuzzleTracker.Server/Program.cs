using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using PuzzleTracker.Server.Data;
using PuzzleTracker.Server.Models;
using PuzzleTracker.Server.Services;
using System.Security.Claims;

// Set EPPlus license for non-commercial use (modern API)
ExcelPackage.License.SetNonCommercialPersonal("PuzzleTracker");

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<PuzzleTrackerContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddScoped<ExcelImportService>();

builder.Services.AddAuthorization();

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 8;
    options.SignIn.RequireConfirmedAccount = false;
})
.AddEntityFrameworkStores<PuzzleTrackerContext>()
.AddDefaultTokenProviders();

// Configure cookie authentication to not redirect on API calls
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Events.OnRedirectToLogin = context =>
    {
        // Only return 401 for API requests
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            return context.Response.WriteAsJsonAsync(new { error = "Unauthorized" });
        }
        context.Response.Redirect(context.RedirectUri);
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";
            return context.Response.WriteAsJsonAsync(new { error = "Forbidden" });
        }
        context.Response.Redirect(context.RedirectUri);
        return Task.CompletedTask;
    };
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});

builder.Services.AddControllers().AddJsonOptions(options =>
{
    // This adds a "$type" property to the JSON so React knows which subclass it's looking at
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient", policy =>
    {
        policy.WithOrigins("https://localhost:63257")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Seed database in development
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<PuzzleTrackerContext>();
        await DatabaseSeeder.SeedAsync(context);
    }
}

// app.UseDefaultFiles();
// app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "PuzzleTracker API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

// Routing must be before CORS in .NET 6+
app.UseRouting();

// CORS must be after routing and before authentication!
app.UseCors("AllowClient");

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

app.UseAuthentication();
app.UseAuthorization();

app.Map("/error", (HttpContext context) =>
{
    return Results.Problem(
        title: "An unexpected error occurred.",
        statusCode: StatusCodes.Status500InternalServerError
    );
});

app.MapPost("/logout", async (SignInManager<ApplicationUser> signInManager) =>
{
    await signInManager.SignOutAsync();
    return Results.Ok();
}).RequireCors("AllowClient").RequireAuthorization();

// Allow the client to verify that the user is authenticated and get their email claim if they are.
app.MapGet("/pingauth", (ClaimsPrincipal user) =>
{
    var email = user.FindFirstValue(ClaimTypes.Email) ?? "No email claim";
    return Results.Json(new { Email = email });
}).RequireCors("AllowClient").RequireAuthorization();

// Map controller endpoints
app.MapControllers().RequireCors("AllowClient");

app.Run();
