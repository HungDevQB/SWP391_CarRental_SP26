package com.carrental.car_rental.dto;

import lombok.Data;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Data
public class BookingConfirmationDTO {
    @NotNull(message = "Car ID is required")
    private Integer carId;

    @NotNull(message = "User ID is required")
    private Integer userId;

    @NotNull(message = "Pickup date is required")
    private LocalDateTime pickupDateTime;

    @NotNull(message = "Dropoff date is required")
    private LocalDateTime dropoffDateTime;

    @NotBlank(message = "Pickup location is required")
    private String pickupLocation;

    @NotBlank(message = "Dropoff location is required")
    private String dropoffLocation;

    private String promoCode;

    @NotNull(message = "Terms agreement is required")
    private Boolean agreeTerms;

    private Boolean delivery;
    private Boolean withDriver;
    private Boolean deliveryRequested;

    private Integer bookingId; // Returned after confirmation
    private PriceBreakdownDTO priceBreakdown; // Returned after confirmation
}
