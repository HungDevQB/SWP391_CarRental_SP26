package com.carrental.car_rental.service;
import com.carrental.car_rental.dto.SupplierRevenueDTO;
import com.carrental.car_rental.entity.SupplierRevenue;
import com.carrental.car_rental.mapper.SupplierRevenueMapper;
import com.carrental.car_rental.repository.SupplierRevenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierRevenueService {
    private final SupplierRevenueRepository repository;
    private final SupplierRevenueMapper mapper;

    public SupplierRevenueDTO findById(Integer id) {
        SupplierRevenue entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SupplierRevenue not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<SupplierRevenueDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> !e.getIsDeleted())
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<SupplierRevenueDTO> findBySupplierId(Integer supplierId) {
        return repository.findBySupplierIdAndIsDeletedFalse(supplierId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public SupplierRevenueDTO save(SupplierRevenueDTO dto) {
        SupplierRevenue entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }

    public SupplierRevenueDTO update(Integer id, SupplierRevenueDTO dto) {
        SupplierRevenue entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SupplierRevenue not found with id: " + id));
        SupplierRevenue updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        updatedEntity.setIsDeleted(false);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        SupplierRevenue entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SupplierRevenue not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }
}