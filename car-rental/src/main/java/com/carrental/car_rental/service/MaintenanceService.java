package com.carrental.car_rental.service;
import com.carrental.car_rental.dto.MaintenanceDTO;
import com.carrental.car_rental.entity.Maintenance;
import com.carrental.car_rental.mapper.MaintenanceMapper;
import com.carrental.car_rental.repository.CarRepository;
import com.carrental.car_rental.repository.MaintenanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MaintenanceService {
    private final MaintenanceRepository repository;
    private final CarRepository carRepository;
    private final MaintenanceMapper mapper;

    public MaintenanceDTO findById(Integer id) {
        Maintenance entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance not found with id: " + id));
        return mapper.toDTO(entity);
    }

    // Lấy tất cả bảo trì (của hoàng)
    public List<MaintenanceDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> !e.getIsDeleted())
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<MaintenanceDTO> findByCarId(Integer carId) {
        return repository.findByCarIdAndIsDeletedFalse(carId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    // Lưu bảo trì mới (của hoàng)
    public MaintenanceDTO save(MaintenanceDTO dto) {
        // Validate carId is not null
        if (dto.getCarId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Car ID is required");
        }
        
        Maintenance entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        
        // Ensure car entity is properly set
        var car = carRepository.findById(dto.getCarId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found with id: " + dto.getCarId()));
        entity.setCar(car);
        
        Maintenance savedEntity = repository.save(entity);
        
        // Fetch the saved entity with car to avoid LazyInitializationException
        Maintenance fetchedEntity = repository.findById(savedEntity.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance not found after save"));
        
        return mapper.toDTO(fetchedEntity);
    }

    public MaintenanceDTO update(Integer id, MaintenanceDTO dto) {
        Maintenance entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance not found with id: " + id));
        
        // Update entity fields from DTO
        entity.setMaintenanceType(dto.getMaintenanceType());
        entity.setServiceCenter(dto.getServiceCenter());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setCost(dto.getCost());
        entity.setDescription(dto.getDescription());
        entity.setStatus(dto.getStatus());
        entity.setNotes(dto.getNotes());
        
        // Ensure car entity is properly set if carId is provided
        if (dto.getCarId() != null) {
            var car = carRepository.findById(dto.getCarId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found with id: " + dto.getCarId()));
            entity.setCar(car);
        }
        
        Maintenance savedEntity = repository.save(entity);
        
        // Fetch the saved entity with car to avoid LazyInitializationException
        Maintenance fetchedEntity = repository.findById(savedEntity.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance not found after update"));
        
        return mapper.toDTO(fetchedEntity);
    }

    public void delete(Integer id) {
        Maintenance entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }

    public List<MaintenanceDTO> findBySupplierId(Integer supplierId) {
        return repository.findBySupplierIdAndIsDeletedFalse(supplierId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }
}