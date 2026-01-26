package com.carrental.car_rental.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "cash_payment_confirmations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@org.hibernate.annotations.DynamicUpdate
public class CashPaymentConfirmation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", referencedColumnName = "payment_id")
    @JsonBackReference
    private Payment payment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", referencedColumnName = "user_id")
    private User supplier;

    @Column(name = "amount_received", precision = 15, scale = 2)
    private BigDecimal amountReceived;

    @Column(name = "currency", length = 10)
    private String currency = "VND";

    @Column(name = "received_at")
    private Instant receivedAt;

    @Column(name = "confirmation_type", length = 20)
    private String confirmationType; // "pickup", "delivery", "return"

    @Column(name = "supplier_confirmation_code", length = 50)
    private String supplierConfirmationCode;

    @Column(name = "is_confirmed")
    private Boolean isConfirmed = false;

    @Column(name = "notes", length = 500)
    private String notes;

    // Platform fee management
    @Column(name = "platform_fee", precision = 15, scale = 2)
    private BigDecimal platformFee;

    @Column(name = "platform_fee_status", length = 30)
    private String platformFeeStatus = "pending"; // "pending", "processing", "paid", "overdue", "penalty_applied", "escalated"

    @Column(name = "platform_fee_payment_id")
    private Integer platformFeePaymentId; // Link to Payment record for platform fee

    @Column(name = "platform_fee_due_date")
    private Instant platformFeeDueDate;

    @Column(name = "platform_fee_paid_at")
    private Instant platformFeePaidAt;
    
    // Overdue handling
    @Column(name = "overdue_penalty_rate", precision = 5, scale = 4)
    private BigDecimal overduePenaltyRate = new BigDecimal("0.05"); // 5% penalty per week
    
    @Column(name = "penalty_amount", precision = 15, scale = 2)
    private BigDecimal penaltyAmount = BigDecimal.ZERO;
    
    @Column(name = "total_amount_due", precision = 15, scale = 2)
    private BigDecimal totalAmountDue; // platform_fee + penalty_amount
    
    @Column(name = "overdue_since")
    private Instant overdueSince; // When it became overdue
    
    @Column(name = "escalation_level")
    private Integer escalationLevel = 0; // 0=none, 1=warning, 2=restriction, 3=suspension

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
