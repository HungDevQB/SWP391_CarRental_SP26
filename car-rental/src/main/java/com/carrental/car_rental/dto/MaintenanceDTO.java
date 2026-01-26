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
public class MaintenanceDTO {
    private Integer maintenanceId;
    private Integer carId;
    private String carName;
    private String maintenanceType;
    private String serviceCenter;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal cost;
    private String description;
    private Integer status;
    private String notes;
    private String carLicensePlate;
    private String maintenanceDetails;
    private BigDecimal maintenanceCost;
    private LocalDateTime maintenanceDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}