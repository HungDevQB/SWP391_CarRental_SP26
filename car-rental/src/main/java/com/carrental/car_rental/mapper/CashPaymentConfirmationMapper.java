package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.CashPaymentConfirmationDTO;
import com.carrental.car_rental.entity.CashPaymentConfirmation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Mapper(componentModel = "spring")
public interface CashPaymentConfirmationMapper {
    @Mapping(target = "bookingId", source = "payment.booking.id")
    @Mapping(target = "paymentId", source = "payment.id")
    @Mapping(target = "receivedAt", source = "receivedAt")
    @Mapping(target = "platformFeeDueDate", source = "platformFeeDueDate")
    CashPaymentConfirmationDTO toDTO(CashPaymentConfirmation entity);

    @Mapping(target = "receivedAt", source = "receivedAt")
    @Mapping(target = "platformFeeDueDate", source = "platformFeeDueDate")
    CashPaymentConfirmation toEntity(CashPaymentConfirmationDTO dto);

    // MapStruct: Instant -> LocalDateTime
    default LocalDateTime map(Instant value) {
        return value == null ? null : LocalDateTime.ofInstant(value, ZoneId.systemDefault());
    }
    // MapStruct: LocalDateTime -> Instant
    default Instant map(LocalDateTime value) {
        return value == null ? null : value.atZone(ZoneId.systemDefault()).toInstant();
    }
} 