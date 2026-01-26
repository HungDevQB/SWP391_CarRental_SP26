package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.RoleDTO;
import com.carrental.car_rental.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(source = "id", target = "roleId")
    @Mapping(source = "roleName", target = "roleName")
    RoleDTO toDTO(Role entity);

    @Mapping(source = "roleId", target = "id")
    @Mapping(source = "roleName", target = "roleName")
    Role toEntity(RoleDTO dto);
}