package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.PromotionApplyDTO;
import com.carrental.car_rental.dto.PromotionDTO;
import com.carrental.car_rental.entity.Promotion;
import com.carrental.car_rental.mapper.PromotionMapper;
import com.carrental.car_rental.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.chrono.ChronoLocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {
    private static final Logger logger = LoggerFactory.getLogger(PromotionService.class);
    private final PromotionRepository repository;
    private final PromotionMapper mapper;

    public PromotionDTO findById(Integer id) {
        Promotion entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<PromotionDTO> findAll() {
        return repository.findByIsDeletedFalse().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public PromotionDTO save(PromotionDTO dto) {
        Promotion entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }

    public PromotionApplyDTO applyPromotion(PromotionApplyDTO dto) {
        logger.info("Applying promotion code: {}", dto.getCode());
        Promotion promotion = repository.findByCode(dto.getCode())
                .filter(p -> !p.getIsDeleted() && p.getEndDate().isAfter(ChronoLocalDate.from(LocalDateTime.now())))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired promo code"));
        dto.setDiscountPercentage(promotion.getDiscountPercentage());
        return dto;
    }

    public List<PromotionDTO> findActivePromotions() {
        return repository.findByIsDeletedFalseAndEndDateAfter(LocalDate.now())
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public PromotionDTO update(Integer id, PromotionDTO dto) {
        Promotion entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion not found with id: " + id));
        Promotion updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        updatedEntity.setIsDeleted(false);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        Promotion entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }
}
