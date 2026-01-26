package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.CarBrandDTO;
import com.carrental.car_rental.entity.CarBrand;
import com.carrental.car_rental.mapper.CarBrandMapper;
import com.carrental.car_rental.repository.CarBrandRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarBrandService {
    private final CarBrandRepository repository;
    private final CarBrandMapper mapper;

    public CarBrandDTO findById(Integer id) {
        CarBrand entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CarBrand not found with id: " + id));
        return mapper.toDTO(entity);
    }

    // Lấy tất cả thương hiệu xe (của hoàng)
    public List<CarBrandDTO> findAll() {
        return repository.findByIsDeletedFalse().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    // Lưu thương hiệu xe mới (của hoàng)
    public CarBrandDTO save(CarBrandDTO dto) {
        CarBrand entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }

    // Cập nhật thương hiệu xe (của hoàng)
    public CarBrandDTO update(Integer id, CarBrandDTO dto) {
        CarBrand entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CarBrand not found with id: " + id));
        CarBrand updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        updatedEntity.setIsDeleted(false);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    // Xóa thương hiệu xe (của hoàng)
    public void delete(Integer id) {
        CarBrand entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CarBrand not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }
}