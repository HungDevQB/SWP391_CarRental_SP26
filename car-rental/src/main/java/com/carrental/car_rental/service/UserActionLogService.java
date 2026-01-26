package com.carrental.car_rental.service;
import com.carrental.car_rental.dto.UserActionLogDTO;
import com.carrental.car_rental.entity.UserActionLog;
import com.carrental.car_rental.mapper.UserActionLogMapper;
import com.carrental.car_rental.repository.UserActionLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserActionLogService {
    private final UserActionLogRepository repository;
    private final UserActionLogMapper mapper;

    public UserActionLogDTO findById(Integer id) {
        UserActionLog entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "UserActionLog not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<UserActionLogDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> !e.getIsDeleted())
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<UserActionLogDTO> findByUserId(Integer userId) {
        return repository.findByUserIdAndIsDeletedFalse(userId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public UserActionLogDTO save(UserActionLogDTO dto) {
        UserActionLog entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }

    public UserActionLogDTO update(Integer id, UserActionLogDTO dto) {
        UserActionLog entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "UserActionLog not found with id: " + id));
        UserActionLog updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        updatedEntity.setIsDeleted(false);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        UserActionLog entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "UserActionLog not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }
}