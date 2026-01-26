package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.InsuranceDTO;
import com.carrental.car_rental.service.InsuranceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insurances")
public class InsuranceController {
    private final InsuranceService service;

    public InsuranceController(InsuranceService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsuranceDTO> getInsurance(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<InsuranceDTO>> getAllInsurances() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<InsuranceDTO>> getInsurancesByBookingId(@PathVariable Integer bookingId) {
        return ResponseEntity.ok(service.findByBookingId(bookingId));
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<InsuranceDTO>> getInsurancesBySupplierId(@PathVariable Integer supplierId) {
        return ResponseEntity.ok(service.findBySupplierId(supplierId));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<InsuranceDTO> createInsurance(@RequestBody InsuranceDTO dto) {
        return ResponseEntity.status(201).body(service.save(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<InsuranceDTO> updateInsurance(@PathVariable Integer id, @RequestBody InsuranceDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<Void> deleteInsurance(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}