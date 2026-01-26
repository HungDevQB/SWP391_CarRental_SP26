package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.SignUpToProvideDTO;
import com.carrental.car_rental.entity.SignUpToProvide;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = CommonMapper.class)
public interface SignUpToProvideMapper {
    @Mapping(source = "id", target = "signUpId")
    @Mapping(source = "supplier.id", target = "userId")
    @Mapping(source = "supplier.createdAt", target = "createdAt", qualifiedByName = "instantToLocalDateTime")
    @Mapping(source = "supplier.updatedAt", target = "updatedAt", qualifiedByName = "instantToLocalDateTime")
    SignUpToProvideDTO toDTO(SignUpToProvide entity);

    @Mapping(source = "signUpId", target = "id")
    @Mapping(source = "userId", target = "supplier.id")
    @Mapping(source = "createdAt", target = "supplier.createdAt", qualifiedByName = "localDateTimeToInstant")
    @Mapping(source = "updatedAt", target = "supplier.updatedAt", qualifiedByName = "localDateTimeToInstant")
    SignUpToProvide toEntity(SignUpToProvideDTO dto);
}