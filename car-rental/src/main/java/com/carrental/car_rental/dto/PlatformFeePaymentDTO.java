package com.carrental.car_rental.dto;

import java.math.BigDecimal;

public class PlatformFeePaymentDTO {
    private Integer confirmationId;
    private Integer supplierId;
    private String supplierName;
    private BigDecimal platformFee;
    private String currency;
    private String description;
    private Integer originalBookingId; // Reference to original booking
    private String notes;
    
    // Payment information
    private String returnUrl;
    private String cancelUrl;
    private String paymentMethod; // "vnpay" or "momo"
    private String paymentUrl; // Generated payment URL for redirect
    
    // Constructors
    public PlatformFeePaymentDTO() {}
    
    public PlatformFeePaymentDTO(Integer confirmationId, Integer supplierId, String supplierName, 
                                BigDecimal platformFee, String currency, String description, 
                                Integer originalBookingId, String notes, String returnUrl, 
                                String cancelUrl, String paymentMethod) {
        this.confirmationId = confirmationId;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.platformFee = platformFee;
        this.currency = currency;
        this.description = description;
        this.originalBookingId = originalBookingId;
        this.notes = notes;
        this.returnUrl = returnUrl;
        this.cancelUrl = cancelUrl;
        this.paymentMethod = paymentMethod;
    }
    
    // Getters and Setters
    public Integer getConfirmationId() { return confirmationId; }
    public void setConfirmationId(Integer confirmationId) { this.confirmationId = confirmationId; }
    
    public Integer getSupplierId() { return supplierId; }
    public void setSupplierId(Integer supplierId) { this.supplierId = supplierId; }
    
    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
    
    public BigDecimal getPlatformFee() { return platformFee; }
    public void setPlatformFee(BigDecimal platformFee) { this.platformFee = platformFee; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Integer getOriginalBookingId() { return originalBookingId; }
    public void setOriginalBookingId(Integer originalBookingId) { this.originalBookingId = originalBookingId; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getReturnUrl() { return returnUrl; }
    public void setReturnUrl(String returnUrl) { this.returnUrl = returnUrl; }
    
    public String getCancelUrl() { return cancelUrl; }
    public void setCancelUrl(String cancelUrl) { this.cancelUrl = cancelUrl; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getPaymentUrl() { return paymentUrl; }
    public void setPaymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; }
}
