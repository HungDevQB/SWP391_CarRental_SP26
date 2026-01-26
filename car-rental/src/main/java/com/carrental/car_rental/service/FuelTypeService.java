package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.FuelTypeDTO;
import com.carrental.car_rental.entity.FuelType;
import com.carrental.car_rental.mapper.FuelTypeMapper;
import com.carrental.car_rental.repository.FuelTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FuelTypeService {
    private final FuelTypeRepository repository;
    private final FuelTypeMapper mapper;

    public FuelTypeDTO findById(Integer id) {
        FuelType entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "FuelType not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<FuelTypeDTO> findAll() {
        return repository.findByIsDeletedFalse().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public FuelTypeDTO save(FuelTypeDTO dto) {
        FuelType entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }

    public FuelTypeDTO update(Integer id, FuelTypeDTO dto) {
        FuelType entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "FuelType not found with id: " + id));
        FuelType updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        updatedEntity.setIsDeleted(false);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        FuelType entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "FuelType not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }
}