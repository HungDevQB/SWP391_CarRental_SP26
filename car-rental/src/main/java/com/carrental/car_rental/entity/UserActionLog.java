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

import java.time.Instant;

@Getter
@Setter
@Entity
public class UserActionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Size(max = 100)
    @NotNull
    @Nationalized
    @Column(name = "\"action\"", nullable = false, length = 100)
    private String action;

    @ColumnDefault("getdate()")
    @Column(name = "\"timestamp\"")
    private Instant timestamp;

    @Size(max = 500)
    @Nationalized
    @Column(name = "details", length = 500)
    private String details;

    @ColumnDefault("0")
    @Column(name = "is_deleted")
    private Boolean isDeleted;

}