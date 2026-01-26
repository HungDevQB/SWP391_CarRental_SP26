package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.CancellationDTO;
import com.carrental.car_rental.entity.Cancellation;
import com.carrental.car_rental.mapper.CancellationMapper;
import com.carrental.car_rental.repository.CancellationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CancellationService {
    private final CancellationRepository repository;
    private final CancellationMapper mapper;

    public CancellationDTO findById(Integer id) {
        Cancellation entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cancellation not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<CancellationDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> !e.getIsDeleted())
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<CancellationDTO> findByBookingId(Integer bookingId) {
        return repository.findByBookingIdAndIsDeletedFalse(bookingId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public CancellationDTO save(CancellationDTO dto) {
        Cancellation entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }

    public CancellationDTO update(Integer id, CancellationDTO dto) {
        Cancellation entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cancellation not found with id: " + id));
        Cancellation updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        updatedEntity.setIsDeleted(false);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        Cancellation entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cancellation not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }
}