package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfigurationDTO {
    private Integer configId;
    private String configKey;
    private String configValue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}