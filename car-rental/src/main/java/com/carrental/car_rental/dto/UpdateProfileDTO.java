package com.carrental.car_rental.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileDTO {
    
    @NotBlank(message = "Username không được để trống")
    @Size(max = 50, message = "Username không được vượt quá 50 ký tự")
    private String username;
    
    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    private String email;
    
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^[0-9+\\s-]+$", message = "Số điện thoại chỉ được chứa số, dấu +, dấu cách và dấu -")
    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    private String phone;
    
    @NotBlank(message = "Mã quốc gia không được để trống")
    @Size(max = 4, message = "Mã quốc gia không được vượt quá 4 ký tự")
    private String countryCode;
    
    @Size(max = 2, message = "Ngôn ngữ ưa thích không được vượt quá 2 ký tự")
    private String preferredLanguage;
    
    @Valid
    private UserDetailDTO userDetail; // Nested object như frontend đang gửi
}
