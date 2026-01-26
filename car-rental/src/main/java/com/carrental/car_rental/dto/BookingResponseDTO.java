package com.carrental.car_rental.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;

@Data
public class BookingResponseDTO {
    private Integer bookingId;
    private Integer customerId;
    private Integer carId;
    private String carModel;
    private String statusName;
    private Instant startDate;
    private Instant endDate;
    private String pickupLocation;
    private String dropoffLocation;
    private Short seatNumber;
    private BigDecimal depositAmount;
    private BigDecimal totalFare;
    private BigDecimal taxAmount;
}