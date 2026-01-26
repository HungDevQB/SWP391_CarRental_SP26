package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.ContractDTO;
import com.carrental.car_rental.entity.Contract;
import com.carrental.car_rental.mapper.ContractMapper;
import com.carrental.car_rental.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractService {
    private final ContractRepository repository;
    private final ContractMapper mapper;

    public ContractDTO findById(Integer id) {
        Contract entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<ContractDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> !e.getIsDeleted())
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ContractDTO> findByBookingId(Integer bookingId) {
        return repository.findByBookingIdAndIsDeletedFalse(bookingId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ContractDTO> findByUserId(Integer userId) {
        return repository.findByUserIdAndIsDeletedFalse(userId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public ContractDTO save(ContractDTO dto) {
        Contract entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }

    public ContractDTO update(Integer id, ContractDTO dto) {
        Contract entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found with id: " + id));
        Contract updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        updatedEntity.setIsDeleted(false);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        Contract entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }
}