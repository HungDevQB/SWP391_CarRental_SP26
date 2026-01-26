package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.FuelTypeDTO;
import com.carrental.car_rental.entity.FuelType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = CommonMapper.class)
public interface FuelTypeMapper {
    @Mapping(source = "id", target = "fuelTypeId")
    @Mapping(source = "fuelTypeName", target = "fuelTypeName")
    FuelTypeDTO toDTO(FuelType entity);

    @Mapping(source = "fuelTypeId", target = "id")
    @Mapping(source = "fuelTypeName", target = "fuelTypeName")
    FuelType toEntity(FuelTypeDTO dto);
}