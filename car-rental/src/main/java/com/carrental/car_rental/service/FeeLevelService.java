package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.FeeLevelDTO;
import com.carrental.car_rental.entity.FeeLevel;
import com.carrental.car_rental.mapper.FeeLevelMapper;
import com.carrental.car_rental.repository.FeeLevelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeeLevelService {
    private final FeeLevelRepository repository;
    private final FeeLevelMapper mapper;

    public FeeLevelDTO findById(Integer id) {
        FeeLevel entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "FeeLevel not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<FeeLevelDTO> findAll() {
        return repository.findByIsDeletedFalse().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public FeeLevelDTO save(FeeLevelDTO dto) {
        FeeLevel entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }

    public FeeLevelDTO update(Integer id, FeeLevelDTO dto) {
        FeeLevel entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "FeeLevel not found with id: " + id));
        FeeLevel updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        updatedEntity.setIsDeleted(false);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        FeeLevel entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "FeeLevel not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }
}