package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.CreateUserDTO;
import com.carrental.car_rental.dto.UpdateUserDTO;
import com.carrental.car_rental.dto.UserDTO;
import com.carrental.car_rental.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = UserDetailMapper.class)
public interface UserMapper {
    @Mapping(source = "id", target = "userId")
    @Mapping(source = "role.id", target = "roleId")
    @Mapping(source = "role.roleName", target = "roleName")
    @Mapping(source = "status.id", target = "statusId")
    @Mapping(source = "status.statusName", target = "statusName")
    @Mapping(source = "countryCode.countryCode", target = "countryCode")
    @Mapping(source = "preferredLanguage.languageCode", target = "preferredLanguage")
    UserDTO toDto(User user);

    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "userDetail", ignore = true)
    @Mapping(source = "roleId", target = "role.id")
    @Mapping(source = "statusId", target = "status.id")
    @Mapping(source = "countryCode", target = "countryCode.countryCode")
    @Mapping(source = "preferredLanguage", target = "preferredLanguage.languageCode")
    @Mapping(target = "isDeleted", constant = "false")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lastLogin", ignore = true)
    User toEntity(CreateUserDTO dto);

    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "userDetail", ignore = true)
    @Mapping(target = "id", ignore = true)  // Don't map id from DTO to entity
    @Mapping(source = "roleId", target = "role.id")
    @Mapping(source = "statusId", target = "status.id")
    @Mapping(source = "countryCode", target = "countryCode.countryCode")
    @Mapping(source = "preferredLanguage", target = "preferredLanguage.languageCode")
    @Mapping(target = "isDeleted", constant = "false")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lastLogin", ignore = true)
    User toEntity(UpdateUserDTO dto);

    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "userDetail", ignore = true)
    @Mapping(source = "roleId", target = "role.id")
    @Mapping(source = "statusId", target = "status.id")
    @Mapping(source = "countryCode", target = "countryCode.countryCode")
    @Mapping(source = "preferredLanguage", target = "preferredLanguage.languageCode")
    @Mapping(target = "isDeleted", constant = "false")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lastLogin", ignore = true)
    User toEntity(UserDTO dto);
}