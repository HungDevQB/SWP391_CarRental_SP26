package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBankAccountDTO {
    
    @NotNull(message = "User ID không được để trống")
    private Integer userId;
    
    @NotBlank(message = "Số tài khoản không được để trống")
    @Size(max = 50, message = "Số tài khoản không được vượt quá 50 ký tự")
    private String accountNumber;
    
    @NotBlank(message = "Tên chủ tài khoản không được để trống")
    @Size(max = 100, message = "Tên chủ tài khoản không được vượt quá 100 ký tự")
    private String accountHolderName;
    
    @NotBlank(message = "Tên ngân hàng không được để trống")
    @Size(max = 100, message = "Tên ngân hàng không được vượt quá 100 ký tự")
    private String bankName;
    
    @Size(max = 100, message = "Chi nhánh không được vượt quá 100 ký tự")
    private String bankBranch;
    
    @Size(max = 20, message = "Mã SWIFT không được vượt quá 20 ký tự")
    private String swiftCode;
    
    @Size(max = 20, message = "Số định tuyến không được vượt quá 20 ký tự")
    private String routingNumber;
    
    @Pattern(regexp = "^(checking|savings|business)$", message = "Loại tài khoản phải là: checking, savings, hoặc business")
    private String accountType = "checking";
    
    private Boolean isPrimary = false;
    
    private Boolean isVerified = false;
}