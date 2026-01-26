package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.CancellationDTO;
import com.carrental.car_rental.service.CancellationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cancellations")
public class CancellationController {
    private final CancellationService service;

    public CancellationController(CancellationService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<CancellationDTO> getCancellation(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<CancellationDTO>> getAllCancellations() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<CancellationDTO>> getCancellationsByBookingId(@PathVariable Integer bookingId) {
        return ResponseEntity.ok(service.findByBookingId(bookingId));
    }

    @PostMapping
    public ResponseEntity<CancellationDTO> createCancellation(@RequestBody CancellationDTO dto) {
        return ResponseEntity.status(201).body(service.save(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CancellationDTO> updateCancellation(@PathVariable Integer id, @RequestBody CancellationDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCancellation(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}