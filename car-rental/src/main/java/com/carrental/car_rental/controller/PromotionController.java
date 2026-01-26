package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.PromotionApplyDTO;
import com.carrental.car_rental.dto.PromotionDTO;
import com.carrental.car_rental.service.PromotionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {
    private static final Logger logger = LoggerFactory.getLogger(PromotionController.class);
    private final PromotionService service;

    public PromotionController(PromotionService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromotionDTO> getPromotion(@PathVariable Integer id) {
        logger.info("Request to get promotion by ID: {}", id);
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<PromotionDTO>> getAllPromotions() {
        logger.info("Request to get all promotions");
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<PromotionDTO>> getActivePromotions() {
        logger.info("Request to get active promotions");
        return ResponseEntity.ok(service.findActivePromotions());
    }

    @PostMapping
    public ResponseEntity<PromotionDTO> createPromotion(@Valid @RequestBody PromotionDTO dto) {
        logger.info("Request to create a new promotion");
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(dto));
    }

    @PostMapping("/apply")
    public ResponseEntity<PromotionApplyDTO> applyPromotion(@Valid @RequestBody PromotionApplyDTO dto) {
        logger.info("Request to apply promotion code: {}", dto.getCode());
        try {
            PromotionApplyDTO appliedPromo = service.applyPromotion(dto);
            logger.info("Promotion applied with discount: {}%", appliedPromo.getDiscountPercentage());
            return ResponseEntity.ok(appliedPromo);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid promotion code: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            logger.error("Error applying promotion: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromotionDTO> updatePromotion(@PathVariable Integer id, @Valid @RequestBody PromotionDTO dto) {
        logger.info("Request to update promotion with ID: {}", id);
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromotion(@PathVariable Integer id) {
        logger.warn("Request to delete promotion with ID: {}", id);
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}