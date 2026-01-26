package com.carrental.car_rental.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PriceBreakdownDTO {
    private BigDecimal basePrice;
    private BigDecimal extraFee;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal total;
    private BigDecimal deposit;
    private BigDecimal serviceFee;
}
