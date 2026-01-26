package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.UserActionLogDTO;
import com.carrental.car_rental.entity.UserActionLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserActionLogMapper {
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.email", target = "userEmail")
    UserActionLogDTO toDTO(UserActionLog entity);

    @Mapping(source = "userId", target = "user.id")
    UserActionLog toEntity(UserActionLogDTO dto);
}