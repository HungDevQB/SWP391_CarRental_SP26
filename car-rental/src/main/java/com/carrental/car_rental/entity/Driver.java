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

import java.time.LocalDate;

@Getter
@Setter
@Entity
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "driver_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "supplier_id", nullable = false)
    private User supplier;

    @Size(max = 100)
    @NotNull
    @Nationalized
    @Column(name = "driver_name", nullable = false, length = 100)
    private String driverName;

    @NotNull
    @Column(name = "dob", nullable = false)
    private LocalDate dob;

    @Size(max = 200)
    @NotNull
    @Nationalized
    @Column(name = "address", nullable = false, length = 200)
    private String address;

    @Size(max = 20)
    @NotNull
    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "country_code", nullable = false)
    private CountryCode countryCode;

    @Size(max = 20)
    @NotNull
    @Column(name = "license_number", nullable = false, length = 20)
    private String licenseNumber;

    @Size(max = 10)
    @Column(name = "license_type", length = 10)
    private String licenseType;

    @Column(name = "license_expiry_date")
    private LocalDate licenseExpiryDate;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "status_id", length = 50, nullable = true)
    private String status;

    @ColumnDefault("0")
    @Column(name = "is_deleted")
    private Boolean isDeleted;

}