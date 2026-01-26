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
import java.time.LocalDate;

@Getter
@Setter
@Entity
public class Maintenance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maintenance_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @Size(max = 100)
    @NotNull
    @Nationalized
    @Column(name = "maintenance_type", nullable = false, length = 100)
    private String maintenanceType;

    @Size(max = 200)
    @NotNull
    @Nationalized
    @Column(name = "service_center", nullable = false, length = 200)
    private String serviceCenter;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "cost", precision = 15, scale = 2)
    private BigDecimal cost;

    @Size(max = 1000)
    @Nationalized
    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "status_id", length = 50)
    private Integer status;

    @Size(max = 1000)
    @Nationalized
    @Column(name = "notes", length = 1000)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "region_id")
    private Region region;

    @ColumnDefault("0")
    @Column(name = "is_deleted")
    private Boolean isDeleted;
}