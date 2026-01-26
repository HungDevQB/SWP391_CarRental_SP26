package com.carrental.car_rental.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Getter
@Setter
@Entity
public class SignUpToProvide {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "signup_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "supplier_id", nullable = false)
    private User supplier;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "feelevel_id", nullable = false)
    private FeeLevel feelevel;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "servicetype_id", nullable = false)
    private ServiceType servicetype;

    @NotNull
    @Column(name = "startdate", nullable = false)
    private LocalDate startdate;

    @NotNull
    @Column(name = "finishdate", nullable = false)
    private LocalDate finishdate;

    @ColumnDefault("0")
    @Column(name = "is_deleted")
    private Boolean isDeleted;

}