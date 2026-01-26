package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.BookingTaxDTO;
import com.carrental.car_rental.entity.BookingTax;
import com.carrental.car_rental.mapper.BookingTaxMapper;
import com.carrental.car_rental.repository.BookingTaxRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingTaxService {
    private final BookingTaxRepository repository;
    private final BookingTaxMapper mapper;

    public BookingTaxDTO findById(Integer id) {
        BookingTax entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new EntityNotFoundException("BookingTax not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<BookingTaxDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> !e.getIsDeleted())
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<BookingTaxDTO> findByBookingId(Integer bookingId) {
        return repository.findByBookingIdAndIsDeletedFalse(bookingId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<BookingTaxDTO> findByTaxId(Integer taxId) {
        return repository.findByTaxIdAndIsDeletedFalse(taxId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public BookingTaxDTO save(BookingTaxDTO dto) {
        BookingTax entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }

    public BookingTaxDTO update(Integer id, BookingTaxDTO dto) {
        BookingTax entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new EntityNotFoundException("BookingTax not found with id: " + id));
        BookingTax updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        updatedEntity.setIsDeleted(false);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        BookingTax entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new EntityNotFoundException("BookingTax not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }
}