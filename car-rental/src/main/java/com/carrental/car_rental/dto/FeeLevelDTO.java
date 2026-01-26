package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeeLevelDTO {
    private Integer feeLevelId;
    private String feeName;
    private BigDecimal feeAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}