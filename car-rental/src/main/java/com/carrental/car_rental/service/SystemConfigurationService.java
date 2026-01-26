package com.carrental.car_rental.service;
import com.carrental.car_rental.dto.SystemConfigurationDTO;
import com.carrental.car_rental.entity.SystemConfiguration;
import com.carrental.car_rental.mapper.SystemConfigurationMapper;
import com.carrental.car_rental.repository.SystemConfigurationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemConfigurationService {
    private final SystemConfigurationRepository repository;
    private final SystemConfigurationMapper mapper;

    public SystemConfigurationDTO findById(Integer id) {
        SystemConfiguration entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SystemConfiguration not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public SystemConfigurationDTO findByConfigKey(String configKey) {
        SystemConfiguration entity = repository.findByConfigKey(configKey)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SystemConfiguration not found with key: " + configKey));
        return mapper.toDTO(entity);
    }

    public List<SystemConfigurationDTO> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public SystemConfigurationDTO save(SystemConfigurationDTO dto) {
        SystemConfiguration entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    public SystemConfigurationDTO update(Integer id, SystemConfigurationDTO dto) {
        SystemConfiguration entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SystemConfiguration not found with id: " + id));
        SystemConfiguration updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        SystemConfiguration entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SystemConfiguration not found with id: " + id));
        repository.delete(entity);
    }
}