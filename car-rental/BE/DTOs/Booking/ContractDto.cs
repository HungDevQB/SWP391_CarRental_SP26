namespace CarRental.API.DTOs.Booking;

// ── Contract DTOs ──────────────────────────────────────────────────────────────

public class ContractDto
{
    public int ContractId { get; set; }
    public int BookingId { get; set; }
    public string ContractCode { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public string? CustomerPhone { get; set; }
    public int SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public int CarId { get; set; }
    public string? CarModel { get; set; }
    public string? CarBrand { get; set; }
    public string? LicensePlate { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string? TermsAndConditions { get; set; }
    public bool SignedByCustomer { get; set; }
    public bool SignedBySupplier { get; set; }
    public string? CustomerSignature { get; set; }
    public string? SupplierSignature { get; set; }
    public int ContractStatusId { get; set; }
    public string? ContractStatusName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Customer license info for supplier to verify before signing
    public LicenseInfoDto? CustomerLicense { get; set; }
}

public class ContractListDto
{
    public int ContractId { get; set; }
    public int BookingId { get; set; }
    public string ContractCode { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public string? CarInfo { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public bool SignedByCustomer { get; set; }
    public bool SignedBySupplier { get; set; }
    public string? ContractStatusName { get; set; }
    public int ContractStatusId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SignContractRequest
{
    public string Signature { get; set; } = string.Empty; // base64 or text signature
}

// ── License Verification DTOs ──────────────────────────────────────────────────

public class LicenseInfoDto
{
    public int UserId { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? DrivingLicense { get; set; }
    public string? DrivingLicenseFrontImage { get; set; }
    public string? DrivingLicenseBackImage { get; set; }
    public string? NationalId { get; set; }
    public string? NationalIdFrontImage { get; set; }
    public string? NationalIdBackImage { get; set; }
    public string LicenseVerificationStatus { get; set; } = "unverified";
    public DateTime? LicenseVerifiedAt { get; set; }
    public int? LicenseVerifiedBy { get; set; }
    public string? LicenseRejectionReason { get; set; }
}

public class VerifyLicenseRequest
{
    public bool Approved { get; set; }
    public string? RejectionReason { get; set; }
}

public class LicenseVerificationListDto
{
    public int UserId { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? DrivingLicense { get; set; }
    public string? DrivingLicenseFrontImage { get; set; }
    public string? DrivingLicenseBackImage { get; set; }
    public string LicenseVerificationStatus { get; set; } = "unverified";
    public int BookingId { get; set; }
    public string? CarInfo { get; set; }
    public DateTime BookingDate { get; set; }
}
