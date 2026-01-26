package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RatingDTO {
    private Integer id;
    private Integer customerId;
    private String customerName;
    private Integer carId;
    private Integer bookingId;
    private Integer ratingScore;
    private String comment;
    private Instant ratingDate;
    private Boolean isAnonymous; // Thêm field này
}

