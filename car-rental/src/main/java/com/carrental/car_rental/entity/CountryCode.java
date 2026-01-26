package com.carrental.car_rental.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
public class CountryCode {
    @Id
    @Size(max = 4)
    @Column(name = "country_code", nullable = false, length = 4)
    private String countryCode;

    @Size(max = 50)
    @NotNull
    @Nationalized
    @Column(name = "country_name", nullable = false, length = 50)
    private String countryName;

}