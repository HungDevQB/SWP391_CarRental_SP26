package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.RatingDTO;
import com.carrental.car_rental.dto.RatingSummaryDTO;
import com.carrental.car_rental.entity.Rating;
import com.carrental.car_rental.entity.User;
import com.carrental.car_rental.entity.Car;
import com.carrental.car_rental.entity.Booking;
import com.carrental.car_rental.mapper.RatingMapper;
import com.carrental.car_rental.repository.RatingRepository;
import com.carrental.car_rental.repository.UserRepository;
import com.carrental.car_rental.repository.CarRepository;
import com.carrental.car_rental.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RatingService {
    private final RatingRepository ratingRepository;
    private final RatingMapper ratingMapper;
    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;

    public RatingDTO findById(Integer id) {
        Rating entity = ratingRepository.findById(id)
                .filter(e -> !Boolean.TRUE.equals(e.getIsDeleted()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rating not found with id: " + id));
        return ratingMapper.toDTO(entity);
    }

    public List<RatingDTO> findAll() {
        try {
            return ratingRepository.findAllWithCustomers().stream()
                    .map(ratingMapper::toDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error fetching all ratings: " + e.getMessage());
        }
    }

    public List<RatingDTO> findByBookingId(Integer bookingId) {
        try {
            return ratingRepository.findByBookingIdAndIsDeletedFalse(bookingId)
                    .stream()
                    .map(ratingMapper::toDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error fetching ratings for booking: " + bookingId + ". " + e.getMessage());
        }
    }

    public List<RatingDTO> findByCarId(Integer carId) {
        try {
            List<Rating> ratings = ratingRepository.findByCarIdAndIsDeletedFalse(carId);
            return ratings.stream()
                    .map(ratingMapper::toDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error fetching ratings for car: " + carId + ". " + e.getMessage());
        }
    }

    public List<RatingSummaryDTO> getRatingSummaryByCarId(Integer carId) {
        try {
            return ratingRepository.findRatingSummaryByCarId(carId)
                    .stream()
                    .map(projection -> new RatingSummaryDTO(
                            projection.getStars(),
                            projection.getPercentage(),
                            projection.getCount()
                    ))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error fetching rating summary for car: " + carId + ". " + e.getMessage());
        }
    }

    @Transactional
    public RatingDTO save(RatingDTO dto) {
        try {
            // Kiểm tra user đã thuê xe này và đã hoàn thành chuyến đi chưa
            if (dto.getCustomerId() != null && dto.getCarId() != null) {
                boolean hasCompletedBooking = bookingRepository.existsByCustomerIdAndCarIdAndStatusName(
                    dto.getCustomerId(), 
                    dto.getCarId(), 
                    "completed"
                ) || bookingRepository.existsByCustomerIdAndCarIdAndStatusName(
                    dto.getCustomerId(),
                    dto.getCarId(),
                    "refunded"
                ) || bookingRepository.existsByCustomerIdAndCarIdAndStatusName(
                    dto.getCustomerId(),
                    dto.getCarId(),
                    "payout"
                );
                if (!hasCompletedBooking) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                        "Bạn chỉ có thể đánh giá xe sau khi đã hoàn thành chuyến đi");
                }
            }
            // Tìm rating cũ của user cho booking này
            List<Rating> existing = ratingRepository.findByBookingIdAndCustomerIdAndIsDeletedFalse(dto.getBookingId(), dto.getCustomerId());
            Rating entity;
            if (!existing.isEmpty()) {
                // Update đánh giá cũ
                entity = existing.get(0);
                entity.setRatingScore(dto.getRatingScore().shortValue());
                entity.setComment(dto.getComment());
                entity.setIsAnonymous(dto.getIsAnonymous() != null ? dto.getIsAnonymous() : false);
                entity.setRatingDate(dto.getRatingDate() != null ? dto.getRatingDate() : Instant.now());
            } else {
                // Tạo mới
                entity = new Rating();
                entity.setRatingScore(dto.getRatingScore().shortValue());
                entity.setComment(dto.getComment());
                entity.setRatingDate(dto.getRatingDate() != null ? dto.getRatingDate() : Instant.now());
                entity.setIsDeleted(false);
                entity.setIsAnonymous(dto.getIsAnonymous() != null ? dto.getIsAnonymous() : false);
                // Set relationships
                if (dto.getCustomerId() != null) {
                    User customer = userRepository.findById(dto.getCustomerId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
                    entity.setCustomer(customer);
                }
                if (dto.getCarId() != null) {
                    Car car = carRepository.findById(dto.getCarId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found"));
                    entity.setCar(car);
                }
                if (dto.getBookingId() != null) {
                    Booking booking = bookingRepository.findById(dto.getBookingId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
                    entity.setBooking(booking);
                }
            }
            return ratingMapper.toDTO(ratingRepository.save(entity));
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error saving rating: " + e.getMessage());
        }
    }

    @Transactional
    public RatingDTO update(Integer id, RatingDTO dto) {
        try {
            Rating entity = ratingRepository.findById(id)
                    .filter(e -> !Boolean.TRUE.equals(e.getIsDeleted()))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rating not found with id: " + id));
            
            entity.setRatingScore(dto.getRatingScore().shortValue());
            entity.setComment(dto.getComment());
            
            return ratingMapper.toDTO(ratingRepository.save(entity));
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error updating rating: " + e.getMessage());
        }
    }

    @Transactional
    public void delete(Integer id) {
        try {
            Rating entity = ratingRepository.findById(id)
                    .filter(e -> !Boolean.TRUE.equals(e.getIsDeleted()))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rating not found with id: " + id));
            entity.setIsDeleted(true);
            ratingRepository.save(entity);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error deleting rating: " + e.getMessage());
        }
    }
}