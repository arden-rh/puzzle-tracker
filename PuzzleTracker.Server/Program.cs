using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PuzzleTracker.Server.Data;
using PuzzleTracker.Server.Models;
using System.Security.Claims;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<PuzzleTrackerContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddAuthorization();

builder.Services.AddIdentityApiEndpoints<ApplicationUser>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    // options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 8;
    // options.Password.RequiredUniqueChars = 1;
}).AddEntityFrameworkStores<PuzzleTrackerContext>();

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

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

app.UseCors("AllowClient");

app.UseAuthorization();

app.MapIdentityApi<ApplicationUser>().RequireCors("AllowClient");

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

app.MapControllers();

app.Run();
