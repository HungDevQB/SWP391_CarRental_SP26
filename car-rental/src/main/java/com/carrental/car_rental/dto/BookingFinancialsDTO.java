package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingFinancialsDTO {
    private Integer bookingId;
    private BigDecimal totalFare;
    private BigDecimal appliedDiscount;
    private BigDecimal lateFeeAmount;
    private Integer lateDays;
    private Boolean isDeleted;
    private BigDecimal serviceFee;
    private BigDecimal tax;
    private BigDecimal finalTotal;
    private BigDecimal deposit;
}