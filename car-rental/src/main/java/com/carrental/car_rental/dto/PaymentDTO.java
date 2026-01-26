package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
    private Integer paymentId;
    private Integer bookingId;
    private BigDecimal amount;
    private String currency;
    private String transactionId;
    private String paymentMethod;
    private String statusName;
    private LocalDateTime paymentDate;
    private String paymentType; // "deposit", "full_payment", "refund"
    
    // Booking-related fields for creating temporary booking
    private Integer carId;
    private LocalDateTime pickupDateTime;
    private LocalDateTime dropoffDateTime;
    private String pickupLocation;
    private String dropoffLocation;
    private Short seatNumber;
    private Boolean withDriver;
    private Boolean deliveryRequested;
    
    // User information
    private Integer userId;
    private Map<String, Object> customerInfo;

    // Thêm các trường xác nhận booking
    private Boolean supplierDeliveryConfirm;
    private Boolean customerReceiveConfirm;
    private Boolean customerReturnConfirm;
    private Boolean supplierReturnConfirm;

    // Thêm các trường tên khách hàng và chủ xe
    private String customerName;
    private String supplierName;

    // Getter/Setter cho các trường mới
    public Boolean getSupplierDeliveryConfirm() { return supplierDeliveryConfirm; }
    public void setSupplierDeliveryConfirm(Boolean supplierDeliveryConfirm) { this.supplierDeliveryConfirm = supplierDeliveryConfirm; }
    public Boolean getCustomerReceiveConfirm() { return customerReceiveConfirm; }
    public void setCustomerReceiveConfirm(Boolean customerReceiveConfirm) { this.customerReceiveConfirm = customerReceiveConfirm; }
    public Boolean getCustomerReturnConfirm() { return customerReturnConfirm; }
    public void setCustomerReturnConfirm(Boolean customerReturnConfirm) { this.customerReturnConfirm = customerReturnConfirm; }
    public Boolean getSupplierReturnConfirm() { return supplierReturnConfirm; }
    public void setSupplierReturnConfirm(Boolean supplierReturnConfirm) { this.supplierReturnConfirm = supplierReturnConfirm; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    // Getter cho paymentStatus (alias cho statusName)
    public String getPaymentStatus() {
        return statusName;
    }
    // Thêm các trường xác nhận tiền mặt
    private Boolean customerCashConfirmed;
    private Boolean supplierCashConfirmed;
    public Boolean getCustomerCashConfirmed() { return customerCashConfirmed; }
    public void setCustomerCashConfirmed(Boolean customerCashConfirmed) { this.customerCashConfirmed = customerCashConfirmed; }
    public Boolean getSupplierCashConfirmed() { return supplierCashConfirmed; }
    public void setSupplierCashConfirmed(Boolean supplierCashConfirmed) { this.supplierCashConfirmed = supplierCashConfirmed; }
}