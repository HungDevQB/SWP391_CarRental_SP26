using CarRental.API.DTOs.Booking;
using CarRental.API.DTOs.Common;
using CarRental.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.API.Controllers;

[ApiController]
[Route("api/contracts")]
[Authorize]
public class ContractController : ControllerBase
{
    private readonly IContractService _contractService;
    private int CurrentUserId => int.Parse(User.FindFirst("userId")?.Value ?? "0");

    public ContractController(IContractService contractService)
    {
        _contractService = contractService;
    }

    // ── Contract endpoints ─────────────────────────────────────────────────

    /// <summary>Get contract by ID</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var contract = await _contractService.GetContractByIdAsync(id);
        return contract == null
            ? NotFound(ApiResponse<object>.Fail("Hợp đồng không tồn tại", 404))
            : Ok(ApiResponse<ContractDto>.Ok(contract));
    }

    /// <summary>Get contract by booking ID</summary>
    [HttpGet("booking/{bookingId:int}")]
    public async Task<IActionResult> GetByBookingId(int bookingId)
    {
        var contract = await _contractService.GetContractByBookingIdAsync(bookingId);
        return Ok(ApiResponse<ContractDto?>.Ok(contract));
    }

    /// <summary>Get all contracts for supplier</summary>
    [Authorize(Roles = "supplier,admin")]
    [HttpGet("supplier/my-contracts")]
    public async Task<IActionResult> GetMyContracts()
    {
        var contracts = await _contractService.GetContractsBySupplierAsync(CurrentUserId);
        return Ok(ApiResponse<IEnumerable<ContractListDto>>.Ok(contracts));
    }

    /// <summary>Get all contracts for customer</summary>
    [HttpGet("customer/my-contracts")]
    public async Task<IActionResult> GetCustomerContracts()
    {
        var contracts = await _contractService.GetContractsByCustomerAsync(CurrentUserId);
        return Ok(ApiResponse<IEnumerable<ContractListDto>>.Ok(contracts));
    }

    /// <summary>Generate contract from booking (supplier action)</summary>
    [Authorize(Roles = "supplier,admin")]
    [HttpPost("generate/{bookingId:int}")]
    public async Task<IActionResult> Generate(int bookingId)
    {
        try
        {
            var contract = await _contractService.GenerateContractAsync(bookingId, CurrentUserId);
            return Ok(ApiResponse<ContractDto>.Created(contract, "Tạo hợp đồng thành công"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.Fail(ex.Message, 404));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.Fail(ex.Message, 403));
        }
    }

    /// <summary>Sign a contract (customer or supplier)</summary>
    [HttpPost("{id:int}/sign")]
    public async Task<IActionResult> Sign(int id, [FromBody] SignContractRequest request)
    {
        try
        {
            var contract = await _contractService.SignContractAsync(id, CurrentUserId, request.Signature);
            return Ok(ApiResponse<ContractDto>.Ok(contract, "Ký hợp đồng thành công"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.Fail(ex.Message, 404));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.Fail(ex.Message, 403));
        }
    }

    /// <summary>Update contract terms (supplier only, draft state)</summary>
    [Authorize(Roles = "supplier,admin")]
    [HttpPut("{id:int}/terms")]
    public async Task<IActionResult> UpdateTerms(int id, [FromBody] UpdateContractTermsRequest request)
    {
        try
        {
            var contract = await _contractService.UpdateContractTermsAsync(id, CurrentUserId, request.Terms);
            return Ok(ApiResponse<ContractDto>.Ok(contract, "Cập nhật điều khoản thành công"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.Fail(ex.Message, 403));
        }
    }

    // ── License verification endpoints ─────────────────────────────────────

    /// <summary>Get customer license info</summary>
    [HttpGet("license/{customerId:int}")]
    public async Task<IActionResult> GetCustomerLicense(int customerId)
    {
        var license = await _contractService.GetCustomerLicenseAsync(customerId);
        return license == null
            ? NotFound(ApiResponse<object>.Fail("Không tìm thấy thông tin bằng lái", 404))
            : Ok(ApiResponse<LicenseInfoDto>.Ok(license));
    }

    /// <summary>Get all pending license verifications for supplier</summary>
    [Authorize(Roles = "supplier,admin")]
    [HttpGet("license/pending")]
    public async Task<IActionResult> GetPendingVerifications()
    {
        var items = await _contractService.GetPendingLicenseVerificationsAsync(CurrentUserId);
        return Ok(ApiResponse<IEnumerable<LicenseVerificationListDto>>.Ok(items));
    }

    /// <summary>Verify customer license (supplier action)</summary>
    [Authorize(Roles = "supplier,admin")]
    [HttpPost("license/{customerId:int}/verify")]
    public async Task<IActionResult> VerifyLicense(int customerId, [FromBody] VerifyLicenseRequest request)
    {
        try
        {
            var result = await _contractService.VerifyLicenseAsync(customerId, CurrentUserId, request);
            string msg = request.Approved ? "Xác minh bằng lái thành công" : "Đã từ chối bằng lái";
            return Ok(ApiResponse<LicenseInfoDto>.Ok(result, msg));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.Fail(ex.Message, 404));
        }
    }
}

public class UpdateContractTermsRequest
{
    public string Terms { get; set; } = string.Empty;
}
