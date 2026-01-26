package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.RegionDTO;
import com.carrental.car_rental.entity.Region;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RegionMapper {
    @Mapping(target = "regionId", source = "id")
    @Mapping(target = "regionName", source = "regionName")
    @Mapping(target = "currency", source = "currency")
    RegionDTO toDTO(Region region);

    @Mapping(target = "id", source = "regionId")
    @Mapping(target = "regionName", source = "regionName")
    @Mapping(target = "currency", source = "currency")
    Region toEntity(RegionDTO regionDTO);
}