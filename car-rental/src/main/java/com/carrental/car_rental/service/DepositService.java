package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.DepositDTO;
import com.carrental.car_rental.entity.Deposit;
import com.carrental.car_rental.mapper.DepositMapper;
import com.carrental.car_rental.repository.DepositRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepositService {
    private final DepositRepository repository;
    private final DepositMapper mapper;

    public DepositDTO findById(Integer id) {
        Deposit entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new EntityNotFoundException("Deposit not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<DepositDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> !e.getIsDeleted())
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<DepositDTO> findByBookingId(Integer bookingId) {
        return repository.findByBookingIdAndIsDeletedFalse(bookingId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public DepositDTO save(DepositDTO dto) {
        Deposit entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }

    public DepositDTO update(Integer id, DepositDTO dto) {
        Deposit entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new EntityNotFoundException("Deposit not found with id: " + id));
        Deposit updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        updatedEntity.setIsDeleted(false);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        Deposit entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new EntityNotFoundException("Deposit not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }
}