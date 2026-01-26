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
public class CarDTO {
    private Integer carId;
    private Integer supplierId;
    private UserDTO supplier; // Thêm thông tin chi tiết chủ xe
    private String licensePlate;
    private String model;
    private Short year;
    private String color;
    private Integer statusId;
    private String statusName;
    private Short numOfSeats;
    private BigDecimal dailyRate;
    private Integer regionId;
    private String regionName;
    private String currency;
    private Integer carBrandId;
    private String brandName;
    private Integer fuelTypeId;
    private String fuelTypeName;
    private String features;
    private String image;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ImageDTO> images;
    private Integer rentalCount;
    private String transmission;
    private String describe;
    private Double averageRating;

}