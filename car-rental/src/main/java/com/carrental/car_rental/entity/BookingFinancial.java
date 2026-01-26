package com.carrental.car_rental.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "BookingFinancials")
public class BookingFinancial {
    @Id
    @Column(name = "booking_id", nullable = false)
    private Integer id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @NotNull
    @Column(name = "total_fare", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalFare;

    @ColumnDefault("0")
    @Column(name = "applied_discount", precision = 10, scale = 2)
    private BigDecimal appliedDiscount;

    @ColumnDefault("0")
    @Column(name = "late_fee_amount", precision = 10, scale = 2)
    private BigDecimal lateFeeAmount;

    @ColumnDefault("0")
    @Column(name = "late_days")
    private Integer lateDays;

    @ColumnDefault("0")
    @Column(name = "is_deleted")
    private Boolean isDeleted;
}