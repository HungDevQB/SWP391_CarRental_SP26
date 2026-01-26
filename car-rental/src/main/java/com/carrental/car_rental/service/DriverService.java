package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.DriverDTO;
import com.carrental.car_rental.entity.Driver;
import com.carrental.car_rental.mapper.DriverMapper;
import com.carrental.car_rental.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverService {
    private final DriverRepository repository;
    private final DriverMapper mapper;

    public DriverDTO findById(Integer id) {
        Driver entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<DriverDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> !e.getIsDeleted())
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<DriverDTO> findByBookingId(Integer bookingId) {
        return repository.findByBookingIdAndIsDeletedFalse(bookingId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<DriverDTO> findByUserId(Integer userId) {
        return repository.findBySupplier_IdAndIsDeletedFalse(userId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public DriverDTO save(DriverDTO dto) {
        Driver entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }

    public DriverDTO update(Integer id, DriverDTO dto) {
        Driver entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found with id: " + id));
        Driver updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        updatedEntity.setIsDeleted(false);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        Driver entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }
}