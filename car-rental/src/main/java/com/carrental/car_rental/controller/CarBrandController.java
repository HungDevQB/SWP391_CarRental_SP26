package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.CarBrandDTO;
import com.carrental.car_rental.service.CarBrandService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/car-brands")
public class CarBrandController {
    private final CarBrandService service;
    private static final Logger logger = LoggerFactory.getLogger(CarBrandController.class);

    public CarBrandController(CarBrandService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarBrandDTO> getCarBrand(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    // Lấy tất cả thương hiệu xe (của hoàng)
    @GetMapping
    public ResponseEntity<List<CarBrandDTO>> getAllCarBrands() {
        logger.info("Gọi API /api/car-brands để lấy danh sách thương hiệu");
        try {
            List<CarBrandDTO> brands = service.findAll();
            logger.info("Trả về {} thương hiệu", brands.size());
            return ResponseEntity.ok(brands);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách thương hiệu: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    // Tạo thương hiệu xe mới (của hoàng)
    @PostMapping
    public ResponseEntity<CarBrandDTO> createCarBrand(@RequestBody CarBrandDTO dto) {
        return ResponseEntity.status(201).body(service.save(dto));
    }

    // Cập nhật thương hiệu xe (của hoàng)
    @PutMapping("/{id}")
    public ResponseEntity<CarBrandDTO> updateCarBrand(@PathVariable Integer id, @RequestBody CarBrandDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // Xóa thương hiệu xe (của hoàng)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCarBrand(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}