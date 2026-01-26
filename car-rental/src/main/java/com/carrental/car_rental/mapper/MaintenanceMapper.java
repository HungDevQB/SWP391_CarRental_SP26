package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.MaintenanceDTO;
import com.carrental.car_rental.entity.Maintenance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDate;

@Mapper(componentModel = "spring")
public interface MaintenanceMapper {
    @Mapping(source = "id", target = "maintenanceId")
    @Mapping(source = "car.id", target = "carId")
    @Mapping(source = "car.model", target = "carName")
    @Mapping(source = "car.licensePlate", target = "carLicensePlate")
    @Mapping(source = "maintenanceType", target = "maintenanceType")
    @Mapping(source = "serviceCenter", target = "serviceCenter")
    @Mapping(source = "startDate", target = "startDate")
    @Mapping(source = "endDate", target = "endDate")
    @Mapping(source = "cost", target = "cost")
    @Mapping(source = "description", target = "description")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "notes", target = "notes")

    MaintenanceDTO toDTO(Maintenance entity);

    @Mapping(source = "maintenanceId", target = "id")
    @Mapping(source = "carId", target = "car", ignore = true)  // Ignore car mapping since we handle it in service
    @Mapping(source = "maintenanceType", target = "maintenanceType")
    @Mapping(source = "serviceCenter", target = "serviceCenter")
    @Mapping(source = "startDate", target = "startDate")
    @Mapping(source = "endDate", target = "endDate")
    @Mapping(source = "cost", target = "cost")
    @Mapping(source = "description", target = "description")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "notes", target = "notes")
    Maintenance toEntity(MaintenanceDTO dto);
}