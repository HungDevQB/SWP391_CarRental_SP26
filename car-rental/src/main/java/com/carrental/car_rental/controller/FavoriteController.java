package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.FavoriteDTO;
import com.carrental.car_rental.service.FavoriteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {
    private static final Logger logger = LoggerFactory.getLogger(FavoriteController.class);
    private final FavoriteService service;

    public FavoriteController(FavoriteService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<FavoriteDTO>> getFavorites() {
        logger.info("Request to get favorites for current user");
        return ResponseEntity.ok(service.findByCurrentUser());
    }

    @PostMapping
    public ResponseEntity<FavoriteDTO> addFavorite(@Valid @RequestBody FavoriteDTO dto) {
        logger.info("Request to add favorite: carId={}, supplierId={}", dto.getCarId(), dto.getSupplierId());
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Integer id) {
        logger.info("Request to remove favorite with ID: {}", id);
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}