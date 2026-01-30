namespace CarRental.API.DTOs.Common;

public class PromotionDto
{
    public int PromotionId { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercentage { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal? MinOrderValue { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? UsageLimit { get; set; }
    public int UsedCount { get; set; }
}

public class CreatePromotionRequest
{
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercentage { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal? MinOrderValue { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? UsageLimit { get; set; }
}

public class ValidatePromotionRequest
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderValue { get; set; }
}
