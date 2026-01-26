package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.TaxDTO;
import com.carrental.car_rental.entity.Tax;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TaxMapper {

    @Mapping(target = "taxId", source = "id")
    @Mapping(target = "countryCode", ignore = true) // Bỏ qua nếu không có trong Region
    @Mapping(target = "countryName", ignore = true) // Bỏ qua nếu không có trong Region
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    TaxDTO toDTO(Tax entity);

    @Mapping(target = "id", source = "taxId")
    @Mapping(target = "region", ignore = true) // Xử lý region trong service layer
    @Mapping(target = "taxType", ignore = true) // Cung cấp giá trị mặc định nếu cần
    @Mapping(target = "description", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    Tax toEntity(TaxDTO dto);
}