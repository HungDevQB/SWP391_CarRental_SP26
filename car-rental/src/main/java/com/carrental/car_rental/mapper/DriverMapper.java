package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.DriverDTO;
import com.carrental.car_rental.entity.Driver;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DriverMapper {
    @Mapping(source = "id", target = "driverId")
    @Mapping(source = "supplier.id", target = "userId")
    @Mapping(source = "driverName", target = "driverName")
    @Mapping(source = "phone", target = "phone")
    @Mapping(source = "licenseNumber", target = "licenseNumber")
    @Mapping(source = "licenseType", target = "licenseType")
    @Mapping(source = "licenseExpiryDate", target = "licenseExpiryDate")
    @Mapping(source = "experienceYears", target = "experienceYears")
    @Mapping(source = "address", target = "address")
    @Mapping(source = "countryCode.countryCode", target = "countryCode")
    @Mapping(source = "dob", target = "dob")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "isDeleted", target = "isDeleted")
    DriverDTO toDTO(Driver driver);

    @Mapping(source = "driverId", target = "id")
    @Mapping(source = "userId", target = "supplier.id")
    @Mapping(source = "driverName", target = "driverName")
    @Mapping(source = "phone", target = "phone")
    @Mapping(source = "licenseNumber", target = "licenseNumber")
    @Mapping(source = "licenseType", target = "licenseType")
    @Mapping(source = "licenseExpiryDate", target = "licenseExpiryDate")
    @Mapping(source = "experienceYears", target = "experienceYears")
    @Mapping(source = "address", target = "address")
    @Mapping(source = "countryCode", target = "countryCode.countryCode")
    @Mapping(source = "dob", target = "dob")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "isDeleted", target = "isDeleted")
    Driver toEntity(DriverDTO driverDTO);
}