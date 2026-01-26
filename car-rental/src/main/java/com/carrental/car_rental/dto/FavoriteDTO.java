package com.carrental.car_rental.dto;

import lombok.Data;

import java.time.LocalDateTime;
import com.carrental.car_rental.dto.CarDTO;

@Data
public class FavoriteDTO {
    private Integer favoriteId;
    private Integer userId;
    private Integer carId;
    private Integer supplierId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private CarDTO car;
}