package com.carrental.car_rental.service;
import com.carrental.car_rental.dto.ServiceTypeDTO;
import com.carrental.car_rental.entity.ServiceType;
import com.carrental.car_rental.mapper.ServiceTypeMapper;
import com.carrental.car_rental.repository.ServiceTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceTypeService {
    private final ServiceTypeRepository repository;
    private final ServiceTypeMapper mapper;

    public ServiceTypeDTO findById(Integer id) {
        ServiceType entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ServiceType not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<ServiceTypeDTO> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public ServiceTypeDTO save(ServiceTypeDTO dto) {
        ServiceType entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    public ServiceTypeDTO update(Integer id, ServiceTypeDTO dto) {
        ServiceType entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ServiceType not found with id: " + id));
        ServiceType updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        ServiceType entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ServiceType not found with id: " + id));
        repository.delete(entity);
    }
}