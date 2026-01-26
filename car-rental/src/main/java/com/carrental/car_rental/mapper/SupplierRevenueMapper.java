package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.SupplierRevenueDTO;
import com.carrental.car_rental.entity.SupplierRevenue;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Mapper(componentModel = "spring")
public interface SupplierRevenueMapper {
    @Mapping(source = "id", target = "revenueId")
    @Mapping(source = "supplier.id", target = "supplierId")
    @Mapping(source = "supplier.email", target = "supplierEmail")
    @Mapping(source = "amount", target = "revenueAmount")
    @Mapping(source = "date", target = "revenueDate", qualifiedByName = "instantToLocalDateTime")
    SupplierRevenueDTO toDTO(SupplierRevenue entity);

    @Mapping(source = "revenueId", target = "id")
    @Mapping(source = "supplierId", target = "supplier.id")
    @Mapping(source = "supplierEmail", target = "supplier.email")
    @Mapping(source = "revenueAmount", target = "amount")
    @Mapping(source = "revenueDate", target = "date", qualifiedByName = "localDateTimeToInstant")
    SupplierRevenue toEntity(SupplierRevenueDTO dto);

    @Named("instantToLocalDateTime")
    default LocalDateTime instantToLocalDateTime(Instant instant) {
        return instant != null ? LocalDateTime.ofInstant(instant, ZoneId.systemDefault()) : null;
    }

    @Named("localDateTimeToInstant")
    default Instant localDateTimeToInstant(LocalDateTime localDateTime) {
        return localDateTime != null ? localDateTime.atZone(ZoneId.systemDefault()).toInstant() : null;
    }
}