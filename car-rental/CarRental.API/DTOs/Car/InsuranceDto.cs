using System.ComponentModel.DataAnnotations;

namespace CarRental.API.DTOs.Car;

public class InsuranceDto
{
    public int InsuranceId { get; set; }
    public int CarId { get; set; }
    public string? InsuranceType { get; set; }
    public string? InsuranceProvider { get; set; }
    public string? InsuranceNumber { get; set; }
    public decimal? CoverageAmount { get; set; }
    public decimal? PremiumAmount { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class CreateInsuranceRequest
{
    [Required]
    public int CarId { get; set; }
    public string? InsuranceType { get; set; }
    public string? InsuranceProvider { get; set; }
    public string? InsuranceNumber { get; set; }
    public decimal? CoverageAmount { get; set; }
    public decimal? PremiumAmount { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
