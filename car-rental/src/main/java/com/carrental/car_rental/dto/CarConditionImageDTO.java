package com.carrental.car_rental.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CarConditionImageDTO {
    private Long imageId;
    private Long reportId;
    private String imageUrl;
    private String imageType;
    private String description;
    private LocalDateTime uploadDate;
}