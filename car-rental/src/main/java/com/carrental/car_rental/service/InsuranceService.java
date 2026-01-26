package com.carrental.car_rental.service;
import com.carrental.car_rental.dto.InsuranceDTO;
import com.carrental.car_rental.entity.Insurance;
import com.carrental.car_rental.mapper.InsuranceMapper;
import com.carrental.car_rental.repository.CarRepository;
import com.carrental.car_rental.repository.InsuranceRepository;
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
public class InsuranceService {
    private final InsuranceRepository repository;
    private final CarRepository carRepository;
    private final InsuranceMapper mapper;

    public InsuranceDTO findById(Integer id) {
        Insurance entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Insurance not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<InsuranceDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> !e.getIsDeleted())
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<InsuranceDTO> findByBookingId(Integer bookingId) {
        return repository.findByBookingIdAndIsDeletedFalse(bookingId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public InsuranceDTO save(InsuranceDTO dto) {
        // Validate carId is not null
        if (dto.getCarId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Car ID is required");
        }
        
        Insurance entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        
        // Ensure car entity is properly set
        var car = carRepository.findById(dto.getCarId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found with id: " + dto.getCarId()));
        entity.setCar(car);
        
        Insurance savedEntity = repository.save(entity);
        
        // Fetch the saved entity with car to avoid LazyInitializationException
        Insurance fetchedEntity = repository.findById(savedEntity.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Insurance not found after save"));
        
        return mapper.toDTO(fetchedEntity);
    }

    public InsuranceDTO update(Integer id, InsuranceDTO dto) {
        Insurance entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Insurance not found with id: " + id));
        
        // Update entity fields from DTO
        entity.setInsuranceType(dto.getInsuranceType());
        entity.setProvider(dto.getInsuranceCompany());
        entity.setPolicyNumber(dto.getPolicyNumber());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setPremium(dto.getPremium());
        entity.setCoverageDetails(dto.getCoverage());
        entity.setStatus(dto.getStatus());
        entity.setNotes(dto.getNotes());
        
        // Ensure car entity is properly set if carId is provided
        if (dto.getCarId() != null) {
            var car = carRepository.findById(dto.getCarId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found with id: " + dto.getCarId()));
            entity.setCar(car);
        }
        
        Insurance savedEntity = repository.save(entity);
        
        // Fetch the saved entity with car to avoid LazyInitializationException
        Insurance fetchedEntity = repository.findById(savedEntity.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Insurance not found after update"));
        
        return mapper.toDTO(fetchedEntity);
    }

    public void delete(Integer id) {
        Insurance entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Insurance not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }

    public List<InsuranceDTO> findBySupplierId(Integer supplierId) {
        return repository.findBySupplierIdAndIsDeletedFalse(supplierId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }
}