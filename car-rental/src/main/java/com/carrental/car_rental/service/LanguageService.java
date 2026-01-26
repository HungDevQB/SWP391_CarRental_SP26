package com.carrental.car_rental.service;
import com.carrental.car_rental.dto.LanguageDTO;
import com.carrental.car_rental.entity.Language;
import com.carrental.car_rental.mapper.LanguageMapper;
import com.carrental.car_rental.repository.LanguageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LanguageService {
    private final LanguageRepository repository;
    private final LanguageMapper mapper;

    public LanguageDTO findById(String id) {
        Language entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Language not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<LanguageDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> !e.getIsDeleted())
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public LanguageDTO save(LanguageDTO dto) {
        Language entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }

    public LanguageDTO update(String id, LanguageDTO dto) {
        Language entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Language not found with id: " + id));
        Language updatedEntity = mapper.toEntity(dto);
        updatedEntity.setLanguageCode(id);
        updatedEntity.setIsDeleted(false);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(String id) {
        Language entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Language not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }
}