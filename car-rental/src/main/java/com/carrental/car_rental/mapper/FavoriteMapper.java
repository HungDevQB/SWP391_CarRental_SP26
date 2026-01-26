package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.CarDTO;
import com.carrental.car_rental.dto.FavoriteDTO;
import com.carrental.car_rental.entity.Favorite;
import com.carrental.car_rental.mapper.CarMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CommonMapper.class, CarMapper.class})
public interface FavoriteMapper {
    @Mapping(source = "id", target = "favoriteId")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "car.id", target = "carId")
    @Mapping(source = "car", target = "car")
    @Mapping(source = "supplier.id", target = "supplierId")
    @Mapping(source = "createdAt", target = "createdAt", qualifiedByName = "instantToLocalDateTime")
    @Mapping(source = "updatedAt", target = "updatedAt", qualifiedByName = "instantToLocalDateTime")
    FavoriteDTO toDTO(Favorite entity);

    @Mapping(source = "favoriteId", target = "id")
    @Mapping(source = "userId", target = "user.id")
    @Mapping(source = "carId", target = "car.id")
    @Mapping(source = "supplierId", target = "supplier.id")
    @Mapping(source = "createdAt", target = "createdAt", qualifiedByName = "localDateTimeToInstant")
    @Mapping(source = "updatedAt", target = "updatedAt", qualifiedByName = "localDateTimeToInstant")
    @Mapping(target = "isDeleted", ignore = true)
    Favorite toEntity(FavoriteDTO dto);
}
