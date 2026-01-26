package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.Promotion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Integer> {
    List<Promotion> findByIsDeletedFalse();

    Optional<Promotion> findByCode(String code);

    List<Promotion> findByIsDeletedFalseAndEndDateAfter(@NotNull LocalDate endDate);
}