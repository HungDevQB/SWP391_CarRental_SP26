package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingTaxDTO {
    private Integer bookingTaxId;
    private Integer bookingId;
    private Integer taxId;
    private String taxName;
    private BigDecimal taxAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}