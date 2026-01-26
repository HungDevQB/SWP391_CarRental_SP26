package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.TaxDTO;
import com.carrental.car_rental.service.TaxService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/taxes")
public class TaxController {
    private final TaxService service;

    public TaxController(TaxService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaxDTO> getTax(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<TaxDTO>> getAllTaxes() {
        return ResponseEntity.ok(service.findAll());
    }


    @PostMapping
    public ResponseEntity<TaxDTO> createTax(@RequestBody TaxDTO dto) {
        return ResponseEntity.status(201).body(service.save(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaxDTO> updateTax(@PathVariable Integer id, @RequestBody TaxDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTax(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}