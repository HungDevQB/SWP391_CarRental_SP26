package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.ServiceTypeDTO;
import com.carrental.car_rental.entity.ServiceType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ServiceTypeMapper {
    @Mapping(source = "id", target = "serviceTypeId")
    @Mapping(source = "servicetypeName", target = "serviceTypeName")
    ServiceTypeDTO toDTO(ServiceType entity);

    @Mapping(source = "serviceTypeId", target = "id")
    @Mapping(source = "serviceTypeName", target = "servicetypeName")
    ServiceType toEntity(ServiceTypeDTO dto);
}