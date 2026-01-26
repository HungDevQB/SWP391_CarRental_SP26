package com.carrental.car_rental.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailDTO {
    private Integer userId;

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must be less than 100 characters")
    private String fullName;

    @Size(max = 200, message = "Address must be less than 200 characters")
    private String address;

    @Size(max = 20, message = "Tax code must be less than 20 characters")
    private String taxcode;

    private Instant createdAt;
    private Instant updatedAt;
}