package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentalHistoryDTO {
    private Integer id;
    private String renterName;
    private String startDate;
    private String endDate;
    private String status;
}