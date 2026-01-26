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

@Getter
@Setter
@Entity
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @Size(max = 255)
    @NotNull
    @Nationalized
    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Size(max = 255)
    @Nationalized
    @Column(name = "description")
    private String description;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "is_main", nullable = false)
    private Boolean isMain = false;

    @ColumnDefault("0")
    @Column(name = "is_deleted")
    private Boolean isDeleted;

}