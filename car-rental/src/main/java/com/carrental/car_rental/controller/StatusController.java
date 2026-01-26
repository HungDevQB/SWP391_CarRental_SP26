package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.StatusDTO;
import com.carrental.car_rental.service.StatusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/statuses")
public class StatusController {
    private final StatusService service;

    public StatusController(StatusService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<StatusDTO> getStatus(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<StatusDTO>> getAllStatuses() {
        return ResponseEntity.ok(service.findAll());
    }

    @PostMapping
    public ResponseEntity<StatusDTO> createStatus(@RequestBody StatusDTO dto) {
        return ResponseEntity.status(201).body(service.save(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StatusDTO> updateStatus(@PathVariable Integer id, @RequestBody StatusDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStatus(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}