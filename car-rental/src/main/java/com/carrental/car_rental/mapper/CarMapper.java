package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.CarDTO;
import com.carrental.car_rental.entity.Car;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CommonMapper.class, ImageMapper.class, UserMapper.class})
public interface CarMapper {
    @Mapping(source = "id", target = "carId")
    @Mapping(source = "supplier.id", target = "supplierId")
    @Mapping(source = "supplier", target = "supplier") // Map thông tin chi tiết chủ xe
    @Mapping(source = "brand.id", target = "carBrandId")
    @Mapping(source = "brand.brandName", target = "brandName")
    @Mapping(source = "licensePlate", target = "licensePlate")
    @Mapping(source = "model", target = "model")
    @Mapping(source = "year", target = "year")
    @Mapping(source = "color", target = "color")
    @Mapping(source = "numOfSeats", target = "numOfSeats")
    @Mapping(source = "region.currency", target = "currency")
    @Mapping(source = "dailyRate", target = "dailyRate")
    @Mapping(source = "region.id", target = "regionId")
    @Mapping(source = "region.regionName", target = "regionName")
    @Mapping(source = "fuelType.id", target = "fuelTypeId")
    @Mapping(source = "fuelType.fuelTypeName", target = "fuelTypeName")
    @Mapping(source = "status.id", target = "statusId")
    @Mapping(source = "status.statusName", target = "statusName")
    @Mapping(source = "features", target = "features")
    @Mapping(source = "transmission", target = "transmission")
    @Mapping(source = "describe", target = "describe")
    @Mapping(source = "image", target = "image") // Ánh xạ từ getter image
    @Mapping(source = "createdAt", target = "createdAt", qualifiedByName = "instantToLocalDateTime")
    @Mapping(source = "updatedAt", target = "updatedAt", qualifiedByName = "instantToLocalDateTime")
    @Mapping(source = "images", target = "images") // Bổ sung mapping images
    @Mapping(target = "rentalCount", ignore = true) // Ignore rentalCount vì không có trong entity
    CarDTO toDTO(Car entity);

    @Mapping(source = "carId", target = "id")
    @Mapping(source = "supplierId", target = "supplier.id")
    @Mapping(source = "carBrandId", target = "brand.id")
    @Mapping(source = "licensePlate", target = "licensePlate")
    @Mapping(source = "model", target = "model")
    @Mapping(source = "year", target = "year")
    @Mapping(source = "color", target = "color")
    @Mapping(source = "numOfSeats", target = "numOfSeats")
    @Mapping(source = "dailyRate", target = "dailyRate")
    @Mapping(source = "regionId", target = "region.id")
    @Mapping(source = "currency", target = "region.currency")
    @Mapping(source = "fuelTypeId", target = "fuelType.id")
    @Mapping(source = "statusId", target = "status.id")
    @Mapping(source = "features", target = "features")
    @Mapping(source = "transmission", target = "transmission")
    @Mapping(source = "describe", target = "describe")
    @Mapping(source = "images", target = "images")
    @Mapping(source = "createdAt", target = "createdAt", qualifiedByName = "localDateTimeToInstant")
    @Mapping(source = "updatedAt", target = "updatedAt", qualifiedByName = "localDateTimeToInstant")
    @Mapping(target = "isDeleted", ignore = true)
    Car toEntity(CarDTO dto);
}
