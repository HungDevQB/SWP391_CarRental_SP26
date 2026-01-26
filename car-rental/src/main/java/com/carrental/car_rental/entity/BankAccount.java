package com.carrental.car_rental.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "BankAccount")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BankAccount {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bank_account_id")
    private Integer bankAccountId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "account_number", nullable = false, length = 50)
    private String accountNumber;
    
    @Column(name = "account_holder_name", nullable = false, length = 100)
    private String accountHolderName;
    
    @Column(name = "bank_name", nullable = false, length = 100)
    private String bankName;
    
    @Column(name = "bank_branch", length = 100)
    private String bankBranch;
    
    @Column(name = "swift_code", length = 20)
    private String swiftCode;
    
    @Column(name = "routing_number", length = 20)
    private String routingNumber;
    
    @Column(name = "account_type", length = 20)
    private String accountType = "checking";
    
    @Column(name = "is_primary")
    private Boolean isPrimary = false;
    
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
}