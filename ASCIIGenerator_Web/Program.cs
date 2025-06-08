using Microsoft.AspNetCore.Builder;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();
builder.Host.UseSerilog((HostBuilderContext host, IServiceProvider services, LoggerConfiguration loggerConfig) =>
{
    loggerConfig.ReadFrom.Configuration(host.Configuration)
    .ReadFrom.Services(services);
});

var app = builder.Build();

app.UseStaticFiles();
app.UseRouting();
app.MapControllers();

app.Run();
