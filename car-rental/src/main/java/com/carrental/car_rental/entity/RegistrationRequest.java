package com.carrental.car_rental.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;

@Entity
@Data
@Table(name = "registration_requests")
public class RegistrationRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "id_number")
    private String idNumber;

    private String address;

    @Column(name = "phone_number")
    private String phoneNumber;

    private String email;

    @Column(name = "car_documents")
    private String carDocuments;

    @Column(name = "business_license")
    private String businessLicense;

    @Column(name = "driver_license")
    private String driverLicense;

    private String status; // pending/approved/rejected

    @NotNull
    @Column(name = "password")
    private String password;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
} 