package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.BookingTaxDTO;
import com.carrental.car_rental.entity.BookingTax;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BookingTaxMapper {
    @Mapping(source = "booking.id", target = "bookingId")
    @Mapping(source = "tax.id", target = "taxId")
    @Mapping(source = "tax.taxName", target = "taxName")
    BookingTaxDTO toDTO(BookingTax entity);

    @Mapping(source = "bookingId", target = "booking.id")
    @Mapping(source = "taxId", target = "tax.id")
    BookingTax toEntity(BookingTaxDTO dto);
}