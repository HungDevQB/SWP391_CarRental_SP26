namespace CarRental.API.DTOs.Booking;

public class SignUpToProvideDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public int? CarId { get; set; }
    public string? CarModel { get; set; }
    public int? ServiceTypeId { get; set; }
    public string? ServiceTypeName { get; set; }
    public string Status { get; set; } = "pending";
    public DateTime? SubmittedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? RejectionReason { get; set; }
}

public class CreateSignUpToProvideRequest
{
    public int? CarId { get; set; }
    public int? ServiceTypeId { get; set; }
}

public class ReviewSignUpRequest
{
    public bool Approved { get; set; }
    public string? RejectionReason { get; set; }
}
