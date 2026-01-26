package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.CancellationDTO;
import com.carrental.car_rental.entity.Cancellation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CancellationMapper {

    @Mapping(target = "cancellationId", source = "id")
    @Mapping(target = "bookingId", source = "booking.id")
    @Mapping(target = "currency", source = "region")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "isDeleted", source = "isDeleted")
    @Mapping(target = "cancellationDate", expression = "java(cancellation.getCancellationDate() != null ? java.time.LocalDateTime.ofInstant(cancellation.getCancellationDate(), java.time.ZoneId.systemDefault()) : null)")
    CancellationDTO toDTO(Cancellation cancellation);

    @Mapping(target = "id", source = "cancellationId")
    @Mapping(target = "booking.id", source = "bookingId")
    @Mapping(target = "region", source = "currency")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "isDeleted", source = "isDeleted")
    @Mapping(target = "cancellationDate", expression = "java(cancellationDTO.getCancellationDate() != null ? cancellationDTO.getCancellationDate().atZone(java.time.ZoneId.systemDefault()).toInstant() : null)")
    Cancellation toEntity(CancellationDTO cancellationDTO);
}