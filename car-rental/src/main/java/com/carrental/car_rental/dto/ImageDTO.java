package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageDTO {
    private Integer imageId;
    private Integer carId;
    private String imageUrl;
    private String description;
    private Boolean isMain;
}