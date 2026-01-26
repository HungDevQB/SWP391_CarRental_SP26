package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaxDTO {
    private Integer taxId;
    private String countryCode;
    private String countryName;
    private String taxName;
    private String taxType; // Thêm trường này
    private BigDecimal taxRate;
    private String description; // Thêm trường này
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}