package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.FeeLevelDTO;
import com.carrental.car_rental.entity.FeeLevel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FeeLevelMapper {
    @Mapping(source = "id", target = "feeLevelId")
    @Mapping(source = "description", target = "feeName")
    @Mapping(source = "price", target = "feeAmount")
    FeeLevelDTO toDTO(FeeLevel entity);

    @Mapping(source = "feeLevelId", target = "id")
    @Mapping(source = "feeName", target = "description")
    @Mapping(source = "feeAmount", target = "price")
    FeeLevel toEntity(FeeLevelDTO dto);
}