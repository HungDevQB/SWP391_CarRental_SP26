package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.CountryCodeDTO;
import com.carrental.car_rental.service.CountryCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/country-codes")
public class CountryCodeController {
    private final CountryCodeService service;

    public CountryCodeController(CountryCodeService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<CountryCodeDTO> getCountryCode(@PathVariable String id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<CountryCodeDTO>> getAllCountryCodes() {
        return ResponseEntity.ok(service.findAll());
    }

    @PostMapping
    public ResponseEntity<CountryCodeDTO> createCountryCode(@RequestBody CountryCodeDTO dto) {
        return ResponseEntity.status(201).body(service.save(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CountryCodeDTO> updateCountryCode(@PathVariable String id, @RequestBody CountryCodeDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCountryCode(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}