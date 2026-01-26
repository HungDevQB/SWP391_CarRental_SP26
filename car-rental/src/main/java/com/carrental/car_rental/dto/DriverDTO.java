package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverDTO {
    private Integer driverId;
    private Integer userId;
    private String driverName;
    private String phone;
    private String licenseNumber;
    private String licenseType;
    private LocalDate licenseExpiryDate;
    private Integer experienceYears;
    private String address;
    private String status;
    private String countryCode;
    private LocalDate dob;
    private Boolean isDeleted;
}