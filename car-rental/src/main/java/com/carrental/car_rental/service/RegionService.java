package com.carrental.car_rental.service;
import com.carrental.car_rental.dto.RegionDTO;
import com.carrental.car_rental.entity.CountryCode;
import com.carrental.car_rental.entity.Region;
import com.carrental.car_rental.mapper.RegionMapper;
import com.carrental.car_rental.repository.CountryCodeRepository;
import com.carrental.car_rental.repository.RegionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegionService {
    private final RegionRepository repository;
    private final RegionMapper mapper;
    private final CountryCodeRepository countryCodeRepository;

    public RegionDTO findById(Integer id) {
        Region entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Region not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<RegionDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> !e.getIsDeleted())
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<RegionDTO> findByCountryCode(String countryCode) {
        CountryCode country = new CountryCode();
        country.setCountryCode(countryCode);
        return repository.findByCountryCodeAndIsDeletedFalse(country).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public RegionDTO save(RegionDTO dto) {
        Region entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }

    public RegionDTO update(Integer id, RegionDTO dto) {
        Region entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Region not found with id: " + id));
        Region updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        updatedEntity.setIsDeleted(false);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        Region entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Region not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }
}