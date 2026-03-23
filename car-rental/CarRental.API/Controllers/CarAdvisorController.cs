using CarRental.API.DTOs.Car;
using CarRental.API.DTOs.Common;
using CarRental.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.API.Controllers;

[ApiController]
[Route("api/car-advisor")]
public class CarAdvisorController : ControllerBase
{
    private readonly ICarAdvisorService _advisor;

    public CarAdvisorController(ICarAdvisorService advisor) => _advisor = advisor;

    /// <summary>Tư vấn chọn xe theo hội thoại (AI nếu cấu hình OpenAI, không thì heuristic).</summary>
    [HttpPost("chat")]
    [AllowAnonymous]
    public async Task<IActionResult> Chat([FromBody] CarAdvisorChatRequest request, CancellationToken cancellationToken)
    {
        if (request.Messages == null || request.Messages.Count == 0)
            return BadRequest(ApiResponse<object>.Fail("Vui lòng gửi ít nhất một tin nhắn", 400));

        var result = await _advisor.ChatAsync(request, cancellationToken);
        return Ok(ApiResponse<CarAdvisorChatResponse>.Ok(result));
    }
}
