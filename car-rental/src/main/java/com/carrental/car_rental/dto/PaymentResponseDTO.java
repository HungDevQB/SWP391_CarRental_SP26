package com.carrental.car_rental.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponseDTO {
    private Integer paymentId;
    private Integer bookingId;
    private BigDecimal amount;
    private String currency;
    private String transactionId;
    private String paymentMethod;
    private String status;
    private String redirectUrl;
    private LocalDateTime paymentDate;
    private BigDecimal totalAmount;
    private PriceBreakdownDTO priceBreakdown;
}
