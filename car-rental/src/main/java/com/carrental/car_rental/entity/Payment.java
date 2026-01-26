package com.carrental.car_rental.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id", nullable = false)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY, optional = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "booking_id", nullable = true)
    private Booking booking;

    @NotNull
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @Size(max = 100)
    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Size(max = 50)
    @NotNull
    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payment_status_id", nullable = false)
    private Status paymentStatus;

    @NotNull
    @ColumnDefault("getdate()")
    @Column(name = "payment_date", nullable = false)
    private Instant paymentDate;

    @ColumnDefault("0")
    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @Column(name = "payment_type", length = 20, nullable = false)
    private String paymentType; // "deposit", "full_payment", "refund"

    @Column(name = "customer_cash_confirmed")
    private Boolean customerCashConfirmed = false;

    @Column(name = "customer_cash_confirmed_at")
    private Instant customerCashConfirmedAt;

    @Column(name = "supplier_cash_confirmed")
    private Boolean supplierCashConfirmed = false;

    @Column(name = "supplier_cash_confirmed_at")
    private Instant supplierCashConfirmedAt;
}