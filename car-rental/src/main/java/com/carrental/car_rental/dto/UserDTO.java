package com.carrental.car_rental.dto;

import com.carrental.car_rental.entity.User;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Integer userId;
    private String username;
    private String email;
    private String phone;
    private Integer roleId;
    private String roleName;
    private Integer statusId;
    private String statusName;
    private String countryCode;
    private String preferredLanguage;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastLogin;
    private UserDetailDTO userDetail;
    private boolean online;
}
