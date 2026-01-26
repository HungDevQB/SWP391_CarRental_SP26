package com.carrental.car_rental.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
@Table(name = "\"Language\"")
public class Language {
    @Id
    @Size(max = 2)
    @Column(name = "language_code", nullable = false, length = 2)
    private String languageCode;

    @Size(max = 50)
    @NotNull
    @Nationalized
    @Column(name = "language_name", nullable = false, length = 50)
    private String languageName;

    @ColumnDefault("0")
    @Column(name = "is_deleted")
    private Boolean isDeleted;

}