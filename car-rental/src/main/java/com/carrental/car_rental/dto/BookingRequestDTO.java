package com.carrental.car_rental.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;

@Data
public class BookingRequestDTO {
    private Integer customerId;
    private Integer carId;
    private Integer driverId;
    private Integer regionId;
    private Integer promoId;
    private Instant startDate;
    private Instant endDate;
    private String pickupLocation;
    private String dropoffLocation;
    private Short seatNumber;
    private BigDecimal depositAmount;
}