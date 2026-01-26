package com.carrental.car_rental.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Entity
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @NotNull
    @ColumnDefault("getdate()")
    @Column(name = "booking_date", nullable = false)
    private Instant bookingDate;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private Instant startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private Instant endDate;

    @Size(max = 200)
    @NotNull
    @Nationalized
    @Column(name = "pickup_location", nullable = false, length = 200)
    private String pickupLocation;

    @Size(max = 200)
    @NotNull
    @Nationalized
    @Column(name = "dropoff_location", nullable = false, length = 200)
    private String dropoffLocation;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "status_id", nullable = false)
    private Status status;

    @Column(name = "seat_number", columnDefinition = "tinyint not null")
    private Short seatNumber;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "deposit_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal depositAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "promo_id")
    private Promotion promo;

    @ColumnDefault("0")
    @Column(name = "extension_days")
    private Integer extensionDays;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "extension_status_id")
    private Status extensionStatus;

    @ColumnDefault("getdate()")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("getdate()")
    @Column(name = "updated_at")
    private Instant updatedAt;

    @ColumnDefault("0")
    @Column(name = "is_deleted")
    private Boolean isDeleted;
    
   @ColumnDefault("0")
    @Column(name = "supplier_delivery_confirm", nullable = false)
    private Boolean supplierDeliveryConfirm = false; 
    
    @ColumnDefault("0")
    @Column(name = "customer_receive_confirm", nullable = false)
    private Boolean customerReceiveConfirm = false; 

    @ColumnDefault("0")
    @Column(name = "customer_return_confirm", nullable = false)
    private Boolean customerReturnConfirm = false; 
    
    @ColumnDefault("0")
    @Column(name = "supplier_return_confirm", nullable = false)
    private Boolean supplierReturnConfirm = false;

    @Column(name = "delivery_confirm_time")
    private Instant deliveryConfirmTime;

    @Column(name = "return_confirm_time")
    private Instant returnConfirmTime;
        
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    @Column(name = "with_driver", nullable = false)
    private Boolean withDriver = false;
    
}