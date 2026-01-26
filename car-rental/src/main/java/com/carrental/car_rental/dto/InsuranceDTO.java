package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceDTO {
    private Integer insuranceId;
    private Integer carId;
    private String carName;
    private String insuranceType;
    private String insuranceCompany;
    private String policyNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal premium;
    private String coverage;
    private Integer status;
    private String notes;
    private Integer bookingId;
    private BigDecimal insuranceCost;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}