package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.carrental.car_rental.entity.Booking;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Integer bookingId;
    private Integer userId; // Maps to Booking.customer_id
    private Integer carId; // Maps to Booking.car_id
    private UserDTO customer;
    private CarDTO car;
    private String carLicensePlate;
    private Integer driverId; // Maps to Booking.driver_id
    private Boolean isSelfDrive;
    private Integer regionId; // Maps to Booking.region_id
    private LocalDateTime bookingDate; // Maps to Booking.bookingDate
    private String pickupLocation; // Maps to Booking.pickup_location
    private String dropoffLocation; // Maps to Booking.dropoff_location
    private LocalDateTime pickupDateTime; // Maps to Booking.startDate
    private LocalDateTime dropoffDateTime; // Maps to Booking.endDate
    
    // ✅ THÊM: Backward compatibility fields
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    private Short seatNumber; // Maps to Booking.seat_number
    private BigDecimal depositAmount; // Maps to Booking.deposit_amount
    private Integer promoId;
    private String promoCode;                    // Mã khuyến mãi
    private String promoDescription;             // Mô tả khuyến mãi
    private BigDecimal discountPercentage;   // Maps to Booking.promo_id
    private Integer extensionDays; // Maps to Booking.extension_days
    private Integer extensionStatusId; // Maps to Booking.extension_status_id
    private Integer statusId; // Maps to Booking.status_id
    private String statusName;
    private LocalDateTime createdAt; // Maps to Booking.created_at
    private LocalDateTime updatedAt; // Maps to Booking.updated_at
    private Boolean withDriver; // Indicates if driver is requested (derived from driverId or explicit)
    private Boolean deliveryRequested; // Indicates if delivery is requested
    private Integer estimatedOvertimeHours; // Estimated overtime in hours

    // Additional fields
    private Boolean isDeleted;  
    private String carModel;
    private String driverName;
    private String regionName;

    private Boolean supplierDeliveryConfirm;
    private Boolean customerReceiveConfirm;
    private Boolean customerReturnConfirm;
    private Boolean supplierReturnConfirm;
    private LocalDateTime deliveryConfirmTime;
    private LocalDateTime returnConfirmTime;
    // private Instant bookingInstant;
    // private Instant createdInstant;

    private BigDecimal totalPaidAmount;
    private String paymentStatus; // "paid", "pending", "failed"
    private String paymentType;   // "deposit", "full_payment", "refund"
    private BigDecimal paymentAmount;
    private LocalDateTime paymentDate;
    private List<PaymentDTO> paymentDetails = new ArrayList<>();
    public Boolean getIsSelfDrive() { 
        return isSelfDrive != null ? isSelfDrive : (driverId == null); 
    }
    public void setIsSelfDrive(Boolean isSelfDrive) { this.isSelfDrive = isSelfDrive; }
    
    @JsonProperty("hasRated")
    private Boolean hasRated; // Computed field - không map từ entity
    
    // getter/setter
    public Boolean getHasRated() {
        return hasRated;
    }
    // ✅ THÊM: Payment flags
    private Boolean hasFullPayment = false;
    private Boolean hasDeposit = false;
    
    public void setHasRated(Boolean hasRated) {
        this.hasRated = hasRated;
    }

    public boolean canCustomerConfirmDelivery() {
        return "confirmed".equals(statusName) && 
               Boolean.TRUE.equals(supplierDeliveryConfirm) && 
               !Boolean.TRUE.equals(customerReceiveConfirm) &&
               "paid".equals(paymentStatus); // ✅ Chỉ cho phép khi đã thanh toán
    }
    
    public boolean canCustomerConfirmReturn() {
        return "in_progress".equals(statusName) && 
               !Boolean.TRUE.equals(customerReturnConfirm);
    }
    
    public boolean isDeliveryCompleted() {
        return Boolean.TRUE.equals(supplierDeliveryConfirm) && 
               Boolean.TRUE.equals(customerReceiveConfirm);
    }
    
    public boolean isReturnCompleted() {
        return Boolean.TRUE.equals(customerReturnConfirm) && 
               Boolean.TRUE.equals(supplierReturnConfirm);
    }

    public boolean isPaid() {
        return "paid".equals(paymentStatus);
    }
    
    public boolean isDepositPaid() {
        return "paid".equals(paymentStatus) && "deposit".equals(paymentType);
    }
    
    public boolean isFullyPaid() {
        return "paid".equals(paymentStatus) && "full_payment".equals(paymentType);
    }

    public Boolean getHasFullPayment() {
        return hasFullPayment != null ? hasFullPayment : false;
    }
    
    public void setHasFullPayment(Boolean hasFullPayment) {
        this.hasFullPayment = hasFullPayment;
    }
    
    public Boolean getHasDeposit() {
        return hasDeposit != null ? hasDeposit : false;
    }
    
    public void setHasDeposit(Boolean hasDeposit) {
        this.hasDeposit = hasDeposit;
    }

    public List<PaymentDTO> getPaymentDetails() {
        return paymentDetails != null ? paymentDetails : new ArrayList<>();
    }
    
    public void setPaymentDetails(List<PaymentDTO> paymentDetails) {
        this.paymentDetails = paymentDetails;
    }
    
    // ✅ THÊM: Helper methods để get payment riêng biệt
    public PaymentDTO getDepositPayment() {
        return paymentDetails.stream()
            .filter(p -> "deposit".equals(p.getPaymentType()))
            .findFirst()
            .orElse(null);
    }
    
    public PaymentDTO getFullPayment() {
        return paymentDetails.stream()
            .filter(p -> "full_payment".equals(p.getPaymentType()))
            .findFirst()
            .orElse(null);
    }
    
    public PaymentDTO getRefundPayment() {
        return paymentDetails.stream()
            .filter(p -> "refund".equals(p.getPaymentType()))
            .findFirst()
            .orElse(null);
    }
    
    // ✅ THÊM: Helper để tính tổng đã trả (deposit + full_payment)
    public BigDecimal getTotalPaidAmount() {
        if (totalPaidAmount != null) return totalPaidAmount;
        // Nếu đã full payment, trả về totalAmount
        if (getHasFullPayment() && getTotalAmount() != null) return getTotalAmount();
        // Nếu chỉ cọc, trả về số tiền cọc
        if (getDepositPayment() != null && getDepositPayment().getAmount() != null) return getDepositPayment().getAmount();
        // Nếu có nhiều payment, cộng lại
        if (paymentDetails != null && !paymentDetails.isEmpty()) {
            return paymentDetails.stream()
                .filter(p -> p.getAmount() != null && ("paid".equals(p.getStatusName()) || "paid".equals(p.getPaymentStatus())))
                .map(PaymentDTO::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        return BigDecimal.ZERO;
    }
    public void setTotalPaidAmount(BigDecimal totalPaidAmount) {
        this.totalPaidAmount = totalPaidAmount;
    }

    // ✅ THÊM: Trường tổng tiền và breakdown cho API by-payment
    private BigDecimal totalAmount;
    private PriceBreakdownDTO priceBreakdown;

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    public PriceBreakdownDTO getPriceBreakdown() {
        return priceBreakdown;
    }
    public void setPriceBreakdown(PriceBreakdownDTO priceBreakdown) {
        this.priceBreakdown = priceBreakdown;
    }

    // --- Thêm các trường trạng thái cho supplier ---
    private Boolean supplierConfirmedFullPayment;
    private Boolean depositRefunded;
    private String refundStatus; // "pending", "completed", null
    private String payoutStatus; // "pending", "completed", null

    public Boolean getSupplierConfirmedFullPayment() { return supplierConfirmedFullPayment; }
    public void setSupplierConfirmedFullPayment(Boolean supplierConfirmedFullPayment) { this.supplierConfirmedFullPayment = supplierConfirmedFullPayment; }
    public Boolean getDepositRefunded() { return depositRefunded; }
    public void setDepositRefunded(Boolean depositRefunded) { this.depositRefunded = depositRefunded; }
    public String getRefundStatus() { return refundStatus; }
    public void setRefundStatus(String refundStatus) { this.refundStatus = refundStatus; }
    public String getPayoutStatus() { return payoutStatus; }
    public void setPayoutStatus(String payoutStatus) { this.payoutStatus = payoutStatus; }

    // Thêm trường này vào DTO
    private List<RatingDTO> ratings = new ArrayList<>();

    // Thêm getter/setter cho ratings
    public List<RatingDTO> getRatings() {
        return ratings != null ? ratings : new ArrayList<>();
    }
    public void setRatings(List<RatingDTO> ratings) {
        this.ratings = ratings != null ? ratings : new ArrayList<>();
    }

// Thêm vào BookingDTO:
private Boolean customerCashPaymentConfirmed = false;
private Boolean supplierCashPaymentConfirmed = false;
private Boolean hasCashDepositPending = false;

// Getters and setters
public Boolean getCustomerCashPaymentConfirmed() {
    return customerCashPaymentConfirmed;
}

public void setCustomerCashPaymentConfirmed(Boolean customerCashPaymentConfirmed) {
    this.customerCashPaymentConfirmed = customerCashPaymentConfirmed;
}

public Boolean getSupplierCashPaymentConfirmed() {
    return supplierCashPaymentConfirmed;
}

public void setSupplierCashPaymentConfirmed(Boolean supplierCashPaymentConfirmed) {
    this.supplierCashPaymentConfirmed = supplierCashPaymentConfirmed;
}

public Boolean getHasCashDepositPending() {
    return hasCashDepositPending;
}

public void setHasCashDepositPending(Boolean hasCashDepositPending) {
    this.hasCashDepositPending = hasCashDepositPending;
}

// Thêm các field cho car condition reports
private Boolean hasPickupReport = false;
private Boolean hasReturnReport = false;

// ✅ THÊM: Extension status name
private String extensionStatusName;

public Boolean getHasPickupReport() {
    return hasPickupReport;
}

public void setHasPickupReport(Boolean hasPickupReport) {
    this.hasPickupReport = hasPickupReport;
}

public Boolean getHasReturnReport() {
    return hasReturnReport;
}

public void setHasReturnReport(Boolean hasReturnReport) {
    this.hasReturnReport = hasReturnReport;
}

public String getExtensionStatusName() {
    return extensionStatusName;
}

public void setExtensionStatusName(String extensionStatusName) {
    this.extensionStatusName = extensionStatusName;
}
}