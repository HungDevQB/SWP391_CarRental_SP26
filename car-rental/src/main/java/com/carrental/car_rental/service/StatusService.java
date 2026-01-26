package com.carrental.car_rental.service;
import com.carrental.car_rental.dto.StatusDTO;
import com.carrental.car_rental.entity.Status;
import com.carrental.car_rental.mapper.StatusMapper;
import com.carrental.car_rental.repository.StatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatusService {
    private final StatusRepository repository;
    private final StatusMapper mapper;

    public StatusDTO findById(Integer id) {
        Status entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Status not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<StatusDTO> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public StatusDTO save(StatusDTO dto) {
        Status entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    public StatusDTO update(Integer id, StatusDTO dto) {
        Status entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Status not found with id: " + id));
        Status updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        Status entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Status not found with id: " + id));
        repository.delete(entity);
    }

    @org.springframework.cache.annotation.Cacheable("statuses")
    public Status findOrCreateActiveStatus() {
        return repository.findByStatusName("active")
                .orElseGet(() -> {
                    Status status = new Status();
                    status.setStatusName("active");
                    return repository.save(status);
                });
    }
}