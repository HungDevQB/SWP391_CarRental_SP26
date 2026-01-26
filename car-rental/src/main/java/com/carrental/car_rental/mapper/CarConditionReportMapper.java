package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.CarConditionReportDTO;
import com.carrental.car_rental.entity.CarConditionReport;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", uses = {CarConditionImageMapper.class})
public interface CarConditionReportMapper {
    CarConditionReportMapper INSTANCE = Mappers.getMapper(CarConditionReportMapper.class);

    @Mapping(source = "statusId", target = "statusId")
    @Mapping(target = "statusName", expression = "java(getStatusName(entity.getStatusId()))")
    @Mapping(source = "images", target = "images")
    CarConditionReportDTO toDTO(CarConditionReport entity);

    @Mapping(source = "statusId", target = "statusId")
    @Mapping(source = "images", target = "images")
    CarConditionReport toEntity(CarConditionReportDTO dto);
    
    default String getStatusName(Integer statusId) {
        if (statusId == null) return "unknown";
        switch (statusId) {
            case 1:
                return "pending";
            case 2:
                return "confirmed";
            default:
                return "unknown";
        }
    }
} 