package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.DepositDTO;
import com.carrental.car_rental.entity.Deposit;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = CommonMapper.class)
public interface DepositMapper {
    @Mapping(target = "depositId", source = "id")
    @Mapping(target = "bookingId", source = "booking.id")
    @Mapping(target = "depositAmount", source = "amount")
    @Mapping(target = "currency", source = "region.currency")
    @Mapping(target = "status", source = "status.statusName")
    @Mapping(target = "refundAmount", source = "refundAmount")
    @Mapping(target = "isDeleted", source = "isDeleted")
    @Mapping(target = "depositDate", source = "depositDate", qualifiedByName = "instantToLocalDateTime")
    @Mapping(target = "refundDate", source = "refundDate", qualifiedByName = "instantToLocalDateTime")
    DepositDTO toDTO(Deposit deposit);

    @Mapping(target = "id", source = "depositId")
    @Mapping(target = "booking.id", source = "bookingId")
    @Mapping(target = "amount", source = "depositAmount")
    @Mapping(target = "region.currency", source = "currency")
    @Mapping(target = "status.statusName", source = "status")
    @Mapping(target = "refundAmount", source = "refundAmount")
    @Mapping(target = "isDeleted", source = "isDeleted")
    @Mapping(target = "depositDate", source = "depositDate", qualifiedByName = "localDateTimeToInstant")
    @Mapping(target = "refundDate", source = "refundDate", qualifiedByName = "localDateTimeToInstant")
    Deposit toEntity(DepositDTO depositDTO);


}