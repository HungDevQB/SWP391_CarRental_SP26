package com.carrental.car_rental.service;
import com.carrental.car_rental.dto.TaxDTO;
import com.carrental.car_rental.entity.Tax;
import com.carrental.car_rental.mapper.TaxMapper;
import com.carrental.car_rental.repository.TaxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaxService {
    private final TaxRepository repository;
    private final TaxMapper mapper;

    public TaxDTO findById(Integer id) {
        Tax entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tax not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<TaxDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> !e.getIsDeleted())
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }


    public TaxDTO save(TaxDTO dto) {
        Tax entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }

    public TaxDTO update(Integer id, TaxDTO dto) {
        Tax entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tax not found with id: " + id));
        Tax updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        updatedEntity.setIsDeleted(false);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        Tax entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tax not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }
}