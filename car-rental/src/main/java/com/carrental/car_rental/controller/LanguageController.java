package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.LanguageDTO;
import com.carrental.car_rental.service.LanguageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/languages")
public class LanguageController {
    private final LanguageService service;

    public LanguageController(LanguageService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<LanguageDTO> getLanguage(@PathVariable String id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<LanguageDTO>> getAllLanguages() {
        return ResponseEntity.ok(service.findAll());
    }

    @PostMapping
    public ResponseEntity<LanguageDTO> createLanguage(@RequestBody LanguageDTO dto) {
        return ResponseEntity.status(201).body(service.save(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LanguageDTO> updateLanguage(@PathVariable String id, @RequestBody LanguageDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLanguage(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}