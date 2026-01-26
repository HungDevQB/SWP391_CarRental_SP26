package com.carrental.car_rental.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CarResponseDTO {
    private Integer carId;
    private String licensePlate;
    private String brandName;
    private String fuelTypeName;
    private String model;
    private Integer year;
    private String color;
    private Short numOfSeats;
    private BigDecimal dailyRate;
    private String regionName;
    private String statusName;
    private String features;

    // Thêm các trường mới
    private String transmission;
    private String describe;
}