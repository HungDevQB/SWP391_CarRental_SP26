package com.carrental.car_rental.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

@Data
public class PromotionApplyDTO {
    @NotBlank(message = "Promo code is required")
    private String code;
    private BigDecimal discountPercentage; // Returned after validation
}
