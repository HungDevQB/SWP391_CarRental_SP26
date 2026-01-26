package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierRevenueDTO {
    private Integer revenueId;
    private Integer supplierId;
    private String supplierEmail;
    private BigDecimal revenueAmount;
    private LocalDateTime revenueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}