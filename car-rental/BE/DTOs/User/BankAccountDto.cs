using System.ComponentModel.DataAnnotations;

namespace CarRental.API.DTOs.User;

public class BankAccountDto
{
    public int BankAccountId { get; set; }
    public int UserId { get; set; }
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountHolderName { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string? BankBranch { get; set; }
    public string? SwiftCode { get; set; }
    public string AccountType { get; set; } = "checking";
    public bool IsPrimary { get; set; }
    public bool IsVerified { get; set; }
}

public class CreateBankAccountRequest
{
    [Required]
    public string AccountNumber { get; set; } = string.Empty;

    [Required]
    public string AccountHolderName { get; set; } = string.Empty;

    [Required]
    public string BankName { get; set; } = string.Empty;

    public string? BankBranch { get; set; }
    public string? SwiftCode { get; set; }
    public string AccountType { get; set; } = "checking";
    public bool IsPrimary { get; set; } = false;
}
