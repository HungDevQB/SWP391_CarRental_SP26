package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.LanguageDTO;
import com.carrental.car_rental.entity.Language;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LanguageMapper {
    LanguageDTO toDTO(Language entity);

    Language toEntity(LanguageDTO dto);
}