package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.FuelTypeDTO;
import com.carrental.car_rental.service.FuelTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fuel-types")
public class FuelTypeController {
    private final FuelTypeService service;

    public FuelTypeController(FuelTypeService service) {
        this.service = service;
    }


    @GetMapping("/{id}")
    public ResponseEntity<FuelTypeDTO> getFuelType(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<FuelTypeDTO>> getAllFuelTypes() {
        return ResponseEntity.ok(service.findAll());
    }

    @PostMapping
    public ResponseEntity<FuelTypeDTO> createFuelType(@RequestBody FuelTypeDTO dto) {
        return ResponseEntity.status(201).body(service.save(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FuelTypeDTO> updateFuelType(@PathVariable Integer id, @RequestBody FuelTypeDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFuelType(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}