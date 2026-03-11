using CarRental.API.Data;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Scheduler;

public class PlatformFeeScheduler : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PlatformFeeScheduler> _logger;

    public PlatformFeeScheduler(IServiceProvider serviceProvider, ILogger<PlatformFeeScheduler> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("PlatformFeeScheduler started");

        while (!stoppingToken.IsCancellationRequested)
        {
            // Run at midnight every day
            var now = DateTime.UtcNow;
            var nextRun = now.Date.AddDays(1);
            var delay = nextRun - now;

            await Task.Delay(delay, stoppingToken);

            if (!stoppingToken.IsCancellationRequested)
            {
                await CheckOverduePlatformFees(stoppingToken);
                await UpdateBookingStatuses(stoppingToken);
            }
        }
    }

    private async Task CheckOverduePlatformFees(CancellationToken ct)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var overdueItems = await context.CashPaymentConfirmations
                .Where(c => !c.IsConfirmed &&
                            c.PlatformFeeDueDate.HasValue &&
                            c.PlatformFeeDueDate < DateTime.UtcNow &&
                            !c.IsDeleted)
                .ToListAsync(ct);

            foreach (var item in overdueItems)
            {
                item.OverdueSince ??= DateTime.UtcNow;
                item.PlatformFeeStatus = "overdue";
                var daysSince = (DateTime.UtcNow - item.OverdueSince.Value).Days;
                item.EscalationLevel = daysSince switch { < 7 => 1, < 30 => 2, _ => 3 };
                item.PenaltyAmount = item.PlatformFee * item.OverduePenaltyRate * daysSince;
                item.TotalAmountDue = item.PlatformFee + item.PenaltyAmount;
                item.UpdatedAt = DateTime.UtcNow;
            }

            await context.SaveChangesAsync(ct);
            _logger.LogInformation("Processed {Count} overdue platform fees", overdueItems.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking overdue platform fees");
        }
    }

    private async Task UpdateBookingStatuses(CancellationToken ct)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Auto-complete bookings where end_date has passed and status is confirmed
            var confirmedStatus = await context.Statuses.FirstOrDefaultAsync(s => s.StatusName == "confirmed", ct);
            var completedStatus = await context.Statuses.FirstOrDefaultAsync(s => s.StatusName == "completed", ct);

            if (confirmedStatus == null || completedStatus == null) return;

            var toComplete = await context.Bookings
                .Where(b => b.StatusId == confirmedStatus.StatusId &&
                            b.EndDate < DateTime.UtcNow &&
                            !b.IsDeleted)
                .ToListAsync(ct);

            foreach (var booking in toComplete)
            {
                booking.StatusId = completedStatus.StatusId;
                booking.UpdatedAt = DateTime.UtcNow;
                // NumOfTrip not in DB schema
            }

            await context.SaveChangesAsync(ct);
            _logger.LogInformation("Auto-completed {Count} bookings", toComplete.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating booking statuses");
        }
    }
}
