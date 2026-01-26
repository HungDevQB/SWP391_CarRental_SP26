package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.PaymentDTO;
import com.carrental.car_rental.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    @Mapping(target = "bookingId", source = "booking.id")
    @Mapping(target = "currency", source = "region.currency")
    @Mapping(target = "statusName", source = "paymentStatus.statusName")
    @Mapping(target = "paymentDate", expression = "java(entity.getPaymentDate() != null ? entity.getPaymentDate().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime() : null)")
    @Mapping(target = "paymentType", source = "paymentType")
    @Mapping(target = "customerCashConfirmed", source = "customerCashConfirmed", defaultValue = "false")
    @Mapping(target = "supplierCashConfirmed", source = "supplierCashConfirmed", defaultValue = "false")
    PaymentDTO toDTO(Payment entity);

    @Mapping(target = "booking", ignore = true)
    @Mapping(target = "region", ignore = true)
    @Mapping(target = "paymentStatus", ignore = true)
    @Mapping(target = "paymentDate", expression = "java(dto.getPaymentDate() != null ? java.time.Instant.from(dto.getPaymentDate().atZone(java.time.ZoneId.systemDefault())) : null)")
    @Mapping(target = "paymentType", source = "paymentType")
    @Mapping(target = "customerCashConfirmed", source = "customerCashConfirmed")
    @Mapping(target = "supplierCashConfirmed", source = "supplierCashConfirmed")
    Payment toEntity(PaymentDTO dto);
}