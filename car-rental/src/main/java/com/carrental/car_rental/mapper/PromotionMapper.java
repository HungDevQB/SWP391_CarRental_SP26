package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.PromotionDTO;
import com.carrental.car_rental.entity.Promotion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Mapper(componentModel = "spring")
public interface PromotionMapper {
    @Mapping(source = "id", target = "promotionId")
    @Mapping(source = "code", target = "code")
    @Mapping(source = "discountPercentage", target = "discountPercentage")
    @Mapping(source = "startDate", target = "startDate", qualifiedByName = "localDateToLocalDateTime")
    @Mapping(source = "endDate", target = "endDate", qualifiedByName = "localDateToLocalDateTime")
    PromotionDTO toDTO(Promotion entity);

    @Mapping(source = "promotionId", target = "id")
    @Mapping(source = "code", target = "code")
    @Mapping(source = "discountPercentage", target = "discountPercentage")
    @Mapping(source = "startDate", target = "startDate", qualifiedByName = "localDateTimeToLocalDate")
    @Mapping(source = "endDate", target = "endDate", qualifiedByName = "localDateTimeToLocalDate")
    Promotion toEntity(PromotionDTO dto);

    @Named("localDateToLocalDateTime")
    default LocalDateTime localDateToLocalDateTime(LocalDate localDate) {
        return localDate != null ? localDate.atStartOfDay() : null;
    }

    @Named("localDateTimeToLocalDate")
    default LocalDate localDateTimeToLocalDate(LocalDateTime localDateTime) {
        return localDateTime != null ? localDateTime.toLocalDate() : null;
    }
}