package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.UserDetailDTO;
import com.carrental.car_rental.entity.UserDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserDetailMapper {
    @Mapping(source = "id", target = "userId")
    @Mapping(source = "name", target = "fullName")
    @Mapping(source = "address", target = "address")
    @Mapping(source = "taxcode", target = "taxcode")
    @Mapping(source = "user.createdAt", target = "createdAt")
    @Mapping(source = "user.updatedAt", target = "updatedAt")
    UserDetailDTO toDTO(UserDetail entity);

    // KHÔNG DÙNG mapping này khi tạo mới UserDetail!
    @Mapping(source = "userId", target = "id")
    @Mapping(source = "fullName", target = "name")
    @Mapping(source = "address", target = "address")
    @Mapping(source = "taxcode", target = "taxcode")
    @Mapping(source = "createdAt", target = "user.createdAt")
    @Mapping(source = "updatedAt", target = "user.updatedAt")
    UserDetail toEntity(UserDetailDTO dto);

}