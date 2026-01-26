package com.carrental.car_rental.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class CarSearchRequestDTO {
    private Integer brandId;
    private Integer fuelTypeId;
    private Integer regionId;
    private Instant startDate;
    private Instant endDate;
    private String pickupLocation;
    private String dropoffLocation;
}