package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.MaintenanceDTO;
import com.carrental.car_rental.service.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenances")
public class MaintenanceController {
    private final MaintenanceService service;

    public MaintenanceController(MaintenanceService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceDTO> getMaintenance(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    // Lấy tất cả bảo trì (của hoàng)
    @GetMapping
    public ResponseEntity<List<MaintenanceDTO>> getAllMaintenances() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/car/{carId}")
    public ResponseEntity<List<MaintenanceDTO>> getMaintenancesByCarId(@PathVariable Integer carId) {
        return ResponseEntity.ok(service.findByCarId(carId));
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<MaintenanceDTO>> getMaintenancesBySupplierId(@PathVariable Integer supplierId) {
        return ResponseEntity.ok(service.findBySupplierId(supplierId));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<MaintenanceDTO> createMaintenance(@RequestBody MaintenanceDTO dto) {
        return ResponseEntity.status(201).body(service.save(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<MaintenanceDTO> updateMaintenance(@PathVariable Integer id, @RequestBody MaintenanceDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<Void> deleteMaintenance(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}