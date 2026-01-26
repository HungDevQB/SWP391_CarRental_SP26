package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.CarConditionImageDTO;
import com.carrental.car_rental.entity.CarConditionImage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CarConditionImageMapper {
    CarConditionImageDTO toDTO(CarConditionImage entity);
    CarConditionImage toEntity(CarConditionImageDTO dto);
} 