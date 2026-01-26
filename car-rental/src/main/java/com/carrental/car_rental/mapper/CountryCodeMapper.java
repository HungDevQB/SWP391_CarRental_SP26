package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.CountryCodeDTO;
import com.carrental.car_rental.entity.CountryCode;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CountryCodeMapper {
    @Mapping(source = "countryCode", target = "countryCode")
    @Mapping(source = "countryName", target = "countryName")
    CountryCodeDTO toDTO(CountryCode entity);

    @Mapping(source = "countryCode", target = "countryCode")
    @Mapping(source = "countryName", target = "countryName")
    CountryCode toEntity(CountryCodeDTO dto);
}