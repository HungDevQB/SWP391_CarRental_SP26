package com.carrental.car_rental.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
public class CashPaymentConfirmationDTO {
    private Integer id; // Confirmation ID (primary key)
    private Integer paymentId;
    private Integer bookingId;
    private BigDecimal amountReceived;
    private String currency;
    private LocalDateTime receivedAt;
    private String notes;
    private String confirmationType; // "pickup", "delivery", "return"
    private String supplierConfirmationCode; // Mã xác nhận từ supplier
    private Boolean isConfirmed;
    private BigDecimal platformFee; // Phí phải chuyển cho platform
    private String platformFeeStatus; // "pending", "paid", "overdue", "penalty_applied", "escalated"
    private LocalDateTime platformFeeDueDate;
    
    // Penalty and overdue fields
    private BigDecimal overduePenaltyRate; // Penalty rate per week
    private BigDecimal penaltyAmount; // Accumulated penalty
    private BigDecimal totalAmountDue; // platform fee + penalty
    private LocalDateTime overdueSince; // When it became overdue
    private Integer escalationLevel; // 0=none, 1=warning, 2=restriction, 3=suspension
    private String escalationDescription; // Human-readable escalation status
}
