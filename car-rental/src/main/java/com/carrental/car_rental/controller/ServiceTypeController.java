package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.ServiceTypeDTO;
import com.carrental.car_rental.service.ServiceTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-types")
public class ServiceTypeController {
    private final ServiceTypeService service;

    public ServiceTypeController(ServiceTypeService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceTypeDTO> getServiceType(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<ServiceTypeDTO>> getAllServiceTypes() {
        return ResponseEntity.ok(service.findAll());
    }

    @PostMapping
    public ResponseEntity<ServiceTypeDTO> createServiceType(@RequestBody ServiceTypeDTO dto) {
        return ResponseEntity.status(201).body(service.save(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceTypeDTO> updateServiceType(@PathVariable Integer id, @RequestBody ServiceTypeDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceType(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}