package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarDetailsResponseDTO {
    private Integer carId;
    private Integer supplierId;
    private String supplierEmail;
    private Integer carBrandId;
    private String brandName;
    private String model;
    private Integer year;
    private String color;
    private Short numOfSeats;
    private Integer regionId;
    private String regionName;
    private String features;
    private Integer fuelTypeId;
    private String fuelTypeName;
    private Integer statusId;
    private String statusName;
    private String licensePlate;
    private BigDecimal dailyRate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ImageDTO> images;
    private List<RatingDTO> ratings;
    private Integer rentalCount;

    // Thêm các trường mới
    private String transmission;
    private String describe;
}