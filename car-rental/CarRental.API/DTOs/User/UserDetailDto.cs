namespace CarRental.API.DTOs.User;

public class UserDetailDto
{
    public int UserDetailId { get; set; }
    public int UserId { get; set; }
    public string? Address { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? NationalId { get; set; }
    public string? NationalIdFrontImage { get; set; }
    public string? NationalIdBackImage { get; set; }
    public string? DrivingLicense { get; set; }
    public string? DrivingLicenseFrontImage { get; set; }
    public string? DrivingLicenseBackImage { get; set; }
    public string? Avatar { get; set; }
    public bool IsVerified { get; set; }
}

public class UpdateProfileRequest
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? CountryCode { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Address { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
}

public class UpdateUserDetailRequest
{
    public string? Address { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? NationalId { get; set; }
    public string? NationalIdFrontImage { get; set; }
    public string? NationalIdBackImage { get; set; }
    public string? DrivingLicense { get; set; }
    public string? DrivingLicenseFrontImage { get; set; }
    public string? DrivingLicenseBackImage { get; set; }
}
