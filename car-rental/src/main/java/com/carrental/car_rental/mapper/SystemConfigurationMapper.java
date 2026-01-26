package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.SystemConfigurationDTO;
import com.carrental.car_rental.entity.SystemConfiguration;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SystemConfigurationMapper {
    SystemConfigurationDTO toDTO(SystemConfiguration entity);

    SystemConfiguration toEntity(SystemConfigurationDTO dto);
}