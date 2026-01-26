package com.carrental.car_rental.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateUserDTO {
    @NotBlank(message = "Username is required")
    @Size(max = 50, message = "Username must be less than 50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must be less than 100 characters")
    private String email;

    @Size(min = 6, max = 255, message = "Password must be between 6 and 255 characters")
    private String password;

    @NotBlank(message = "Phone is required")
    @Size(max = 20, message = "Phone must be less than 20 characters")
    private String phone;

    @NotNull(message = "Role ID is required")
    private Integer roleId;

    @NotNull(message = "Status ID is required")
    private Integer statusId;

    @NotNull(message = "Country code is required")
    private String countryCode;

    private String preferredLanguage;

    private UserDetailDTO userDetail;
}