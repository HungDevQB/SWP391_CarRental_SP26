package com.carrental.car_rental.service;
import com.carrental.car_rental.dto.SignUpToProvideDTO;
import com.carrental.car_rental.entity.SignUpToProvide;
import com.carrental.car_rental.mapper.SignUpToProvideMapper;
import com.carrental.car_rental.repository.SignUpToProvideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SignUpToProvideService {
    private final SignUpToProvideRepository repository;
    private final SignUpToProvideMapper mapper;

    public SignUpToProvideDTO findById(Integer id) {
        SignUpToProvide entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SignUpToProvide not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<SignUpToProvideDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> !e.getIsDeleted())
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<SignUpToProvideDTO> findByUserId(Integer userId) {
        return repository.findBySupplierIdAndIsDeletedFalse(userId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public SignUpToProvideDTO save(SignUpToProvideDTO dto) {
        SignUpToProvide entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }

    public SignUpToProvideDTO update(Integer id, SignUpToProvideDTO dto) {
        SignUpToProvide entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SignUpToProvide not found with id: " + id));
        SignUpToProvide updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        updatedEntity.setIsDeleted(false);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        SignUpToProvide entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SignUpToProvide not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }
}