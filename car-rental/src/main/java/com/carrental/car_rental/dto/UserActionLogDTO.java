package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserActionLogDTO {
    private Integer logId;
    private Integer userId;
    private String userEmail;
    private String action;
    private LocalDateTime actionDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}