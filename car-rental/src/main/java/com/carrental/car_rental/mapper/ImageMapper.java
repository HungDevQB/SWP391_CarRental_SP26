package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.ImageDTO;
import com.carrental.car_rental.entity.Image;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ImageMapper {
    @Mapping(source = "id", target = "imageId")
    @Mapping(source = "car.id", target = "carId")
    @Mapping(source = "imageUrl", target = "imageUrl")
    @Mapping(source = "description", target = "description")
    @Mapping(source = "isMain", target = "isMain")
    ImageDTO toDTO(Image entity);

    @Mapping(source = "imageId", target = "id")
    @Mapping(source = "carId", target = "car.id")
    @Mapping(source = "imageUrl", target = "imageUrl")
    @Mapping(source = "description", target = "description")
    @Mapping(source = "isMain", target = "isMain")
    Image toEntity(ImageDTO dto);

    // In ImageMapper.java
    @Mapping(target = "id", ignore = true)
    void partialUpdate(@MappingTarget Image entity, ImageDTO dto);

}