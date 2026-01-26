package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.RatingDTO;
import com.carrental.car_rental.dto.RatingSummaryDTO;
import com.carrental.car_rental.service.RatingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {
    private static final Logger logger = LoggerFactory.getLogger(RatingController.class);
    private final RatingService service;

    public RatingController(RatingService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<RatingDTO> getRating(@PathVariable Integer id) {
        logger.info("Request to get rating by ID: {}", id);
        try {
            return ResponseEntity.ok(service.findById(id));
        } catch (Exception e) {
            logger.error("Error fetching rating with ID {}: {}", id, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error fetching rating: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<RatingDTO>> getAllRatings() {
        logger.info("Request to get all ratings");
        try {
            List<RatingDTO> ratings = service.findAll();
            return ResponseEntity.ok(ratings);
        } catch (Exception e) {
            logger.error("Error fetching all ratings: ", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error fetching ratings: " + e.getMessage());
        }
    }

    @GetMapping(params = "carId")
    public ResponseEntity<List<RatingDTO>> getRatingsByCarId(@RequestParam Integer carId) {
        logger.info("Request to get ratings for car ID: {}", carId);
        try {
            return ResponseEntity.ok(service.findByCarId(carId));
        } catch (Exception e) {
            logger.error("Error fetching ratings for car ID {}: {}", carId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error fetching ratings for car: " + e.getMessage());
        }
    }

    @GetMapping(params = "bookingId")
    public ResponseEntity<List<RatingDTO>> getRatingsByBookingId(@RequestParam Integer bookingId) {
        logger.info("Request to get ratings for booking ID: {}", bookingId);
        try {
            return ResponseEntity.ok(service.findByBookingId(bookingId));
        } catch (Exception e) {
            logger.error("Error fetching ratings for booking ID {}: {}", bookingId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error fetching ratings for booking: " + e.getMessage());
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<List<RatingSummaryDTO>> getRatingSummaryByCarId(@RequestParam Integer carId) {
        logger.info("Request to get rating summary for car ID: {}", carId);
        try {
            return ResponseEntity.ok(service.getRatingSummaryByCarId(carId));
        } catch (Exception e) {
            logger.error("Error fetching rating summary for car ID {}: {}", carId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error fetching rating summary: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<RatingDTO> createRating(@RequestBody RatingDTO dto) {
        logger.info("Request to create rating for car ID: {}", dto.getCarId());
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.save(dto));
        } catch (Exception e) {
            logger.error("Error creating rating: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error creating rating: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<RatingDTO> updateRating(@PathVariable Integer id, @RequestBody RatingDTO dto) {
        logger.info("Request to update rating with ID: {}", id);
        try {
            return ResponseEntity.ok(service.update(id, dto));
        } catch (Exception e) {
            logger.error("Error updating rating with ID {}: {}", id, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error updating rating: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRating(@PathVariable Integer id) {
        logger.info("Request to delete rating with ID: {}", id);
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting rating with ID {}: {}", id, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error deleting rating: " + e.getMessage());
        }
    }
}