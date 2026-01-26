package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.ContractDTO;
import com.carrental.car_rental.entity.Contract;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ContractMapper {

    @Mapping(target = "contractId", source = "id")
    @Mapping(target = "bookingId", source = "booking.id")
    @Mapping(target = "contractCode", source = "contractCode")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerEmail", source = "customer.email")
    @Mapping(target = "supplierId", source = "supplier.id")
    @Mapping(target = "supplierEmail", source = "supplier.email")
    @Mapping(target = "carId", source = "car.id")
    @Mapping(target = "driverId", source = "driver.id")
    @Mapping(target = "startDate", source = "startDate")
    @Mapping(target = "endDate", source = "endDate")
    @Mapping(target = "termsAndConditions", source = "termsAndConditions")
    @Mapping(target = "customerSignature", source = "customerSignature")
    @Mapping(target = "supplierSignature", source = "supplierSignature")
    @Mapping(target = "contractStatusId", source = "contractStatus.id")
    @Mapping(target = "contractStatusName", source = "contractStatus.statusName")
    @Mapping(target = "createdAt", expression = "java(contract.getCreatedAt() != null ? java.time.LocalDateTime.ofInstant(contract.getCreatedAt(), java.time.ZoneId.systemDefault()) : null)")
    @Mapping(target = "updatedAt", expression = "java(contract.getUpdatedAt() != null ? java.time.LocalDateTime.ofInstant(contract.getUpdatedAt(), java.time.ZoneId.systemDefault()) : null)")
    @Mapping(target = "isDeleted", source = "isDeleted")
    ContractDTO toDTO(Contract contract);

    @Mapping(target = "id", source = "contractId")
    @Mapping(target = "booking.id", source = "bookingId")
    @Mapping(target = "contractCode", source = "contractCode")
    @Mapping(target = "customer.id", source = "customerId")
    @Mapping(target = "customer.email", source = "customerEmail")
    @Mapping(target = "supplier.id", source = "supplierId")
    @Mapping(target = "supplier.email", source = "supplierEmail")
    @Mapping(target = "car.id", source = "carId")
    @Mapping(target = "driver.id", source = "driverId")
    @Mapping(target = "startDate", source = "startDate")
    @Mapping(target = "endDate", source = "endDate")
    @Mapping(target = "termsAndConditions", source = "termsAndConditions")
    @Mapping(target = "customerSignature", source = "customerSignature")
    @Mapping(target = "supplierSignature", source = "supplierSignature")
    @Mapping(target = "contractStatus.id", source = "contractStatusId")
    @Mapping(target = "contractStatus.statusName", source = "contractStatusName")
    @Mapping(target = "createdAt", expression = "java(contractDTO.getCreatedAt() != null ? contractDTO.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant() : null)")
    @Mapping(target = "updatedAt", expression = "java(contractDTO.getUpdatedAt() != null ? contractDTO.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant() : null)")
    @Mapping(target = "isDeleted", source = "isDeleted")
    Contract toEntity(ContractDTO contractDTO);
}