package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.StatusDTO;
import com.carrental.car_rental.entity.Status;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StatusMapper {
    @Mapping(source = "id", target = "statusId")
    @Mapping(source = "statusName", target = "statusName")
    StatusDTO toDTO(Status entity);

    @Mapping(source = "statusId", target = "id")
    @Mapping(source = "statusName", target = "statusName")
    Status toEntity(StatusDTO dto);
}