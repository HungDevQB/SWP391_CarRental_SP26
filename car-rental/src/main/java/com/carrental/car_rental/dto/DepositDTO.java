package com.carrental.car_rental.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepositDTO {
    private Integer depositId;

    @NotNull(message = "Booking ID is required")
    private Integer bookingId;

    @NotNull(message = "Deposit amount is required")
    @Positive(message = "Deposit amount must be positive")
    private BigDecimal depositAmount;

    @NotBlank(message = "Currency is required")
    private String currency;

    @NotNull(message = "Deposit date is required")
    private LocalDateTime depositDate;

    @NotBlank(message = "Status is required")
    private String status;

    private BigDecimal refundAmount;

    private LocalDateTime refundDate;

    private Boolean isDeleted;

}