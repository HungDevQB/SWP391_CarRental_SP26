package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.RegionDTO;
import com.carrental.car_rental.service.RegionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/regions")
public class RegionController {
    private final RegionService service;

    public RegionController(RegionService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegionDTO> getRegion(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<RegionDTO>> getAllRegions() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/country/{countryCode}")
    public ResponseEntity<List<RegionDTO>> getRegionsByCountryCode(@PathVariable String countryCode) {
        return ResponseEntity.ok(service.findByCountryCode(countryCode));
    }

    @PostMapping
    public ResponseEntity<RegionDTO> createRegion(@RequestBody RegionDTO dto) {
        return ResponseEntity.status(201).body(service.save(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RegionDTO> updateRegion(@PathVariable Integer id, @RequestBody RegionDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRegion(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}