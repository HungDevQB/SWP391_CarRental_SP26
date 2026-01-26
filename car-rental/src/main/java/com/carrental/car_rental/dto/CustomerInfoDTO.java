package com.carrental.car_rental.dto;

import lombok.Data;

@Data
public class CustomerInfoDTO {
    private Integer id;
    private String username;
    private String fullName;
    private String email;
}
