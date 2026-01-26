package com.carrental.car_rental.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class VehicleDTO {
    @NotBlank(message = "Tên xe không được để trống")
    private String name;

    @NotBlank(message = "Hãng xe không được để trống")
    private String brand;

    @NotBlank(message = "Biển số không được để trống")
    private String licensePlate;

    @NotBlank(message = "Mô tả không được để trống")
    private String description;

    @NotNull(message = "Giá thuê không được để trống")
    @Positive(message = "Giá thuê phải lớn hơn 0")
    private Double rentalPrice;

    private MultipartFile image;
    private String region;
    private String fuelType;
    private String transmission;
    private Integer numOfSeats;
    private Integer year;
    private String color;

} 