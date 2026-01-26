package com.carrental.car_rental.dto;

import lombok.Data;

@Data
public class CustomerDTO {
    private Integer id;
    private Integer userId;
    private String customerName;
    private String address;
}