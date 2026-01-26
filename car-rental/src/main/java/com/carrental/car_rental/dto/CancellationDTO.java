package com.carrental.car_rental.dto;

import com.carrental.car_rental.entity.Region;
import com.carrental.car_rental.entity.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CancellationDTO {
    private Integer cancellationId;

    @NotNull(message = "Booking ID is required")
    private Integer bookingId;

    @NotBlank(message = "Reason is required")
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;

    @NotBlank(message = "Currency is required")
    private Region currency;

    @NotNull(message = "Refund amount is required")
    @PositiveOrZero(message = "Refund amount must be zero or positive")
    private BigDecimal refundAmount;

    @NotNull(message = "Cancellation date is required")
    private LocalDateTime cancellationDate;

    private Boolean isDeleted;

    @NotBlank(message = "Status is required")
    private Status status;
}