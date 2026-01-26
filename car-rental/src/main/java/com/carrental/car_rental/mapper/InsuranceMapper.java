package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.InsuranceDTO;
import com.carrental.car_rental.entity.Insurance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InsuranceMapper {
    @Mapping(source = "id", target = "insuranceId")
    @Mapping(source = "car.id", target = "carId")
    @Mapping(source = "car.model", target = "carName")
    @Mapping(source = "insuranceType", target = "insuranceType")
    @Mapping(source = "provider", target = "insuranceCompany")  // Map provider to insuranceCompany
    @Mapping(source = "policyNumber", target = "policyNumber")
    @Mapping(source = "startDate", target = "startDate")
    @Mapping(source = "endDate", target = "endDate")
    @Mapping(source = "premium", target = "premium")
    @Mapping(source = "coverageDetails", target = "coverage")   // Map coverageDetails to coverage
    @Mapping(source = "status", target = "status")
    @Mapping(source = "notes", target = "notes")
    InsuranceDTO toDTO(Insurance entity);

    @Mapping(source = "insuranceId", target = "id")
    @Mapping(source = "carId", target = "car", ignore = true)  // Ignore car mapping since we handle it in service
    @Mapping(source = "insuranceType", target = "insuranceType")
    @Mapping(source = "insuranceCompany", target = "provider")  // Map insuranceCompany to provider
    @Mapping(source = "policyNumber", target = "policyNumber")
    @Mapping(source = "startDate", target = "startDate")
    @Mapping(source = "endDate", target = "endDate")
    @Mapping(source = "premium", target = "premium")
    @Mapping(source = "coverage", target = "coverageDetails")   // Map coverage to coverageDetails
    @Mapping(source = "status", target = "status")
    @Mapping(source = "notes", target = "notes")
    Insurance toEntity(InsuranceDTO dto);
}