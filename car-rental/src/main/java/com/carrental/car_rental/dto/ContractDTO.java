package com.carrental.car_rental.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContractDTO {
    private Integer contractId;

    @NotNull(message = "Booking ID is required")
    private Integer bookingId;

    @NotBlank(message = "Contract code is required")
    @Size(max = 50, message = "Contract code must not exceed 50 characters")
    private String contractCode;

    @NotNull(message = "Customer ID is required")
    private Integer customerId;

    private String customerEmail;

    @NotNull(message = "Supplier ID is required")
    private Integer supplierId;

    private String supplierEmail;

    @NotNull(message = "Car ID is required")
    private Integer carId;

    @NotNull(message = "Driver ID is required")
    private Integer driverId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @Size(max = 4000, message = "Terms and conditions must not exceed 4000 characters")
    private String termsAndConditions;

    @Size(max = 255, message = "Customer signature must not exceed 255 characters")
    private String customerSignature;

    @Size(max = 255, message = "Supplier signature must not exceed 255 characters")
    private String supplierSignature;

    @NotNull(message = "Contract status ID is required")
    private Integer contractStatusId;

    private String contractStatusName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Boolean isDeleted;
}