package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignUpToProvideDTO {
    private Integer signUpId;
    private Integer userId;
    private String businessDetails;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}