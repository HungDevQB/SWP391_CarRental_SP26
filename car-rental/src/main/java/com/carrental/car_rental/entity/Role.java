package com.carrental.car_rental.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id", nullable = false)
    private Integer id;

    @Size(max = 20)
    @NotNull
    @Column(name = "role_name", nullable = false, length = 20)
    private String roleName;

    @Size(max = 200)
    @Nationalized
    @Column(name = "description", length = 200)
    private String description;

    @ColumnDefault("0")
    @Column(name = "is_deleted")
    private Boolean isDeleted;

}