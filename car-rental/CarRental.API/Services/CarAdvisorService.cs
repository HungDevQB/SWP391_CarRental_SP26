using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using CarRental.API.DTOs.Car;
using CarRental.API.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CarRental.API.Services;

public class CarAdvisorService : ICarAdvisorService
{
    private readonly ICarService _carService;
    private readonly IHttpClientFactory _httpFactory;
    private readonly IConfiguration _config;
    private readonly ILogger<CarAdvisorService> _logger;

    public CarAdvisorService(
        ICarService carService,
        IHttpClientFactory httpFactory,
        IConfiguration config,
        ILogger<CarAdvisorService> logger)
    {
        _carService = carService;
        _httpFactory = httpFactory;
        _config = config;
        _logger = logger;
    }

    public async Task<CarAdvisorChatResponse> ChatAsync(CarAdvisorChatRequest request, CancellationToken cancellationToken = default)
    {
        var catalog = await LoadCatalogAsync(cancellationToken);
        if (catalog.Count == 0)
        {
            return new CarAdvisorChatResponse
            {
                Reply = "Hiện chưa có xe khả dụng trong hệ thống. Bạn vui lòng quay lại sau nhé.",
                Cars = new List<CarAdvisorCarDto>(),
                UsedAiModel = false
            };
        }

        var apiKey = _config["OpenAI:ApiKey"]?.Trim();
        var model = _config["OpenAI:Model"]?.Trim() ?? "gpt-4o-mini";

        if (!string.IsNullOrEmpty(apiKey))
        {
            try
            {
                return await ChatWithOpenAiAsync(request, catalog, apiKey, model, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "OpenAI car advisor failed, using heuristic fallback");
            }
        }

        return HeuristicResponse(request, catalog);
    }

    private async Task<List<CarListDto>> LoadCatalogAsync(CancellationToken ct)
    {
        var page = await _carService.SearchAsync(new CarSearchRequest
        {
            Page = 0,
            Size = 60,
            SortBy = "newest"
        });
        return page.Content;
    }

    private async Task<CarAdvisorChatResponse> ChatWithOpenAiAsync(
        CarAdvisorChatRequest request,
        List<CarListDto> catalog,
        string apiKey,
        string model,
        CancellationToken ct)
    {
        var catalogText = string.Join("\n", catalog.Select(FormatCatalogLine));
        var systemPrompt =
            "Bạn là trợ lý AI tư vấn thuê xe ô tô tại Việt Nam. Chỉ được gợi ý xe nằm trong danh sách dưới đây (không bịa thêm hãng hoặc giá).\n" +
            "Danh sách xe đang cho thuê (mỗi dòng: id: mô tả):\n" +
            catalogText +
            "\n\nQuy tắc:\n" +
            "- Trả lời bằng tiếng Việt, ngắn gọn, thân thiện (2–6 câu).\n" +
            "- Hỏi thêm nếu thiếu thông tin quan trọng (ngân sách/ngày, số chỗ, loại nhiên liệu, khu vực).\n" +
            "- Chỉ đề xuất xe thật sự phù hợp tiêu chí.\n" +
            "- Ở CUỐI cùng, thêm ĐÚNG MỘT dòng JSON thuần (không markdown), ví dụ: {\"carIds\":[12,34]} — tối đa 3 id từ danh sách. Nếu chưa chọn được thì {\"carIds\":[]}.\n";

        var trimmed = request.Messages
            .Where(m => m.Role is "user" or "assistant")
            .TakeLast(16)
            .ToList();

        var openAiMessages = new List<object>
        {
            new { role = "system", content = systemPrompt }
        };
        foreach (var m in trimmed)
            openAiMessages.Add(new { role = m.Role, content = m.Content });

        var payload = new
        {
            model,
            messages = openAiMessages,
            temperature = 0.45,
            max_tokens = 900
        };

        var client = _httpFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        using var httpReq = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions")
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };

        using var httpRes = await client.SendAsync(httpReq, ct);
        var body = await httpRes.Content.ReadAsStringAsync(ct);
        if (!httpRes.IsSuccessStatusCode)
        {
            _logger.LogWarning("OpenAI HTTP {Status}: {Body}", (int)httpRes.StatusCode, body);
            throw new InvalidOperationException("OpenAI request failed");
        }

        using var doc = JsonDocument.Parse(body);
        var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString()
                      ?? "";

        var ids = ExtractCarIds(content);
        var reply = StripJsonTail(content);
        var cars = MapRecommendations(catalog, ids);

        return new CarAdvisorChatResponse
        {
            Reply = string.IsNullOrWhiteSpace(reply) ? "Mình đã xem các xe phù hợp trong hệ thống." : reply.Trim(),
            Cars = cars,
            UsedAiModel = true
        };
    }

    private static string FormatCatalogLine(CarListDto c) =>
        $"{c.CarId}: {c.BrandName} {c.CarModel} ({c.Year?.ToString() ?? "?"}), {c.Seats?.ToString() ?? "?"} chỗ, " +
        $"{c.FuelTypeName ?? "N/A"}, {c.RentalPricePerDay:N0} VNĐ/ngày, {c.RegionName ?? "N/A"}";

    private static List<int> ExtractCarIds(string aiContent)
    {
        var match = Regex.Match(aiContent, @"""carIds""\s*:\s*\[\s*([\d,\s]*)\s*\]", RegexOptions.Singleline);
        if (!match.Success)
            return new List<int>();

        return match.Groups[1].Value
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(s => int.TryParse(s, out var id) ? id : (int?)null)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .Distinct()
            .Take(5)
            .ToList();
    }

    private static string StripJsonTail(string content)
    {
        var idx = content.LastIndexOf("{\"carIds\"", StringComparison.Ordinal);
        if (idx < 0)
            idx = content.LastIndexOf("{ \"carIds\"", StringComparison.OrdinalIgnoreCase);
        if (idx <= 0)
            return content;
        return content[..idx].TrimEnd();
    }

    private static List<CarAdvisorCarDto> MapRecommendations(List<CarListDto> catalog, List<int> ids)
    {
        var set = ids.ToHashSet();
        return catalog
            .Where(c => set.Contains(c.CarId))
            .OrderBy(c => ids.IndexOf(c.CarId))
            .Select(c => new CarAdvisorCarDto
            {
                CarId = c.CarId,
                BrandName = c.BrandName,
                CarModel = c.CarModel,
                Year = c.Year,
                Seats = c.Seats,
                RentalPricePerDay = c.RentalPricePerDay,
                RegionName = c.RegionName,
                FuelTypeName = c.FuelTypeName,
                ThumbnailUrl = c.ThumbnailUrl
            })
            .ToList();
    }

    private CarAdvisorChatResponse HeuristicResponse(CarAdvisorChatRequest request, List<CarListDto> catalog)
    {
        var lastUser = request.Messages.LastOrDefault(m => m.Role == "user")?.Content ?? "";
        var ids = HeuristicPickIds(lastUser, catalog, 3);
        var cars = MapRecommendations(catalog, ids);

        var sb = new StringBuilder();
        sb.Append("Mình chưa kết nối AI ngoài (hoặc đang dùng chế độ gợi ý nội bộ). ");
        if (cars.Count == 0)
        {
            sb.Append("Bạn cho mình thêm: ngân sách mỗi ngày (VNĐ), số chỗ, hãng xe hoặc khu vực để mình lọc chính xác hơn nhé.");
        }
        else
        {
            sb.Append("Dựa trên mô tả của bạn, đây là vài lựa chọn đang có sẵn trên hệ thống — bạn có thể xem chi tiết và đặt xe ngay.");
        }

        return new CarAdvisorChatResponse
        {
            Reply = sb.ToString(),
            Cars = cars,
            UsedAiModel = false
        };
    }

    private static List<int> HeuristicPickIds(string userMessage, List<CarListDto> catalog, int max)
    {
        if (string.IsNullOrWhiteSpace(userMessage))
            return catalog.Take(max).Select(c => c.CarId).ToList();

        var msg = userMessage.ToLowerInvariant();
        var scored = catalog.Select(c => (c, Score: ScoreMatch(c, msg))).OrderByDescending(x => x.Score).ToList();

        var picked = scored.Where(x => x.Score > 0).Take(max).Select(x => x.c.CarId).ToList();
        if (picked.Count > 0)
            return picked;

        return catalog.Take(max).Select(c => c.CarId).ToList();
    }

    private static int ScoreMatch(CarListDto c, string msg)
    {
        var score = 0;
        if (!string.IsNullOrEmpty(c.BrandName) && msg.Contains(c.BrandName.ToLowerInvariant(), StringComparison.Ordinal))
            score += 25;
        if (!string.IsNullOrEmpty(c.CarModel) && msg.Contains(c.CarModel.ToLowerInvariant(), StringComparison.Ordinal))
            score += 20;
        if (!string.IsNullOrEmpty(c.FuelTypeName) && msg.Contains(c.FuelTypeName.ToLowerInvariant(), StringComparison.Ordinal))
            score += 12;

        var seatMatch = Regex.Match(msg, @"(\d+)\s*chỗ");
        if (seatMatch.Success && int.TryParse(seatMatch.Groups[1].Value, out var seats) && c.Seats == seats)
            score += 22;

        // Giá: "1 triệu", "1tr", "500k" / ngày
        var budgetDay = TryParseBudgetVndPerDay(msg);
        if (budgetDay.HasValue && c.RentalPricePerDay > 0)
        {
            if (c.RentalPricePerDay <= budgetDay.Value)
                score += 18;
            else if (c.RentalPricePerDay <= budgetDay.Value * 1.15m)
                score += 8;
        }

        if (!string.IsNullOrEmpty(c.RegionName) && msg.Contains(c.RegionName.ToLowerInvariant(), StringComparison.Ordinal))
            score += 10;

        return score;
    }

    private static decimal? TryParseBudgetVndPerDay(string msg)
    {
        var m = Regex.Match(msg, @"(\d+(?:[.,]\d+)?)\s*(triệu|tr\b)", RegexOptions.IgnoreCase);
        if (m.Success && decimal.TryParse(m.Groups[1].Value.Replace(',', '.'), System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out var trieu))
            return trieu * 1_000_000m;

        m = Regex.Match(msg, @"(\d+)\s*k\b", RegexOptions.IgnoreCase);
        if (m.Success && int.TryParse(m.Groups[1].Value, out var k))
            return k * 1000m;

        m = Regex.Match(msg, @"(\d{1,3}(?:[.,]\d{3})+|\d{6,})\s*(đồng|vnd)?", RegexOptions.IgnoreCase);
        if (m.Success)
        {
            var digits = Regex.Replace(m.Groups[1].Value, @"[^\d]", "");
            if (decimal.TryParse(digits, out var vnd) && vnd >= 50_000)
                return vnd;
        }

        return null;
    }
}
