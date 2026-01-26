package com.carrental.car_rental.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "CarConditionReport")
@Data
public class CarConditionReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "car_id", nullable = false)
    private Long carId;

    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false)
    private ReportType reportType;

    @Column(name = "status_id", nullable = false)
    private Integer statusId = 1; // Default to pending status

    @Column(name = "report_date", nullable = false)
    private LocalDateTime reportDate = LocalDateTime.now();

    @Column(name = "fuel_level", precision = 5, scale = 2)
    private BigDecimal fuelLevel;

    @Column(name = "mileage")
    private Integer mileage;

    @Enumerated(EnumType.STRING)
    @Column(name = "exterior_condition")
    private ConditionLevel exteriorCondition = ConditionLevel.GOOD;

    @Enumerated(EnumType.STRING)
    @Column(name = "interior_condition")
    private ConditionLevel interiorCondition = ConditionLevel.GOOD;

    @Enumerated(EnumType.STRING)
    @Column(name = "engine_condition")
    private ConditionLevel engineCondition = ConditionLevel.GOOD;

    @Enumerated(EnumType.STRING)
    @Column(name = "tire_condition")
    private ConditionLevel tireCondition = ConditionLevel.GOOD;

    @Column(name = "damage_notes", length = 1000)
    private String damageNotes;

    @Column(name = "additional_notes", length = 500)
    private String additionalNotes;

    @Column(name = "is_confirmed")
    private Boolean isConfirmed = false;

    @Column(name = "confirmed_by")
    private Long confirmedBy;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CarConditionImage> images;

    public enum ReportType {
        PICKUP, RETURN
    }

    public enum ConditionLevel {
        EXCELLENT, GOOD, FAIR, POOR
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}