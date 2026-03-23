namespace CarRental.API.DTOs.User;

public class RegistrationRequestDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? UserEmail { get; set; }
    public string? UserName { get; set; }
    public string? NationalId { get; set; }
    public string? NationalIdFront { get; set; }
    public string? NationalIdBack { get; set; }
    public string? DrivingLicense { get; set; }
    public string? DrivingLicenseFront { get; set; }
    public string? DrivingLicenseBack { get; set; }
    public bool IsSubmitted { get; set; }
    public bool IsApproved { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SubmitRegistrationRequest
{
    public string? NationalId { get; set; }
    public string? NationalIdFront { get; set; }
    public string? NationalIdBack { get; set; }
    public string? DrivingLicense { get; set; }
    public string? DrivingLicenseFront { get; set; }
    public string? DrivingLicenseBack { get; set; }
}

public class ReviewRegistrationRequest
{
    public bool Approved { get; set; }
    public string? RejectionReason { get; set; }
}
