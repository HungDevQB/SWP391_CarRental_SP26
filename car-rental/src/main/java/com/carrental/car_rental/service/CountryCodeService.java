package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.CountryCodeDTO;
import com.carrental.car_rental.entity.CountryCode;
import com.carrental.car_rental.mapper.CountryCodeMapper;
import com.carrental.car_rental.repository.CountryCodeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CountryCodeService {
    private final CountryCodeRepository repository;
    private final CountryCodeMapper mapper;

    public CountryCodeDTO findById(String id) {
        CountryCode entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("CountryCode not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<CountryCodeDTO> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public CountryCodeDTO save(CountryCodeDTO dto) {
        CountryCode entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    public CountryCodeDTO update(String id, CountryCodeDTO dto) {
        CountryCode entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("CountryCode not found with id: " + id));
        CountryCode updatedEntity = mapper.toEntity(dto);
        updatedEntity.setCountryCode(id);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(String id) {
        CountryCode entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("CountryCode not found with id: " + id));
        repository.delete(entity);
    }
}