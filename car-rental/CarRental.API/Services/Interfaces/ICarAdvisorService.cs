using CarRental.API.DTOs.Car;

namespace CarRental.API.Services.Interfaces;

public interface ICarAdvisorService
{
    Task<CarAdvisorChatResponse> ChatAsync(CarAdvisorChatRequest request, CancellationToken cancellationToken = default);
}
