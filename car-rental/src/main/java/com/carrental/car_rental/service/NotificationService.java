package com.carrental.car_rental.service;
import com.carrental.car_rental.dto.NotificationDTO;
import com.carrental.car_rental.entity.Notification;
import com.carrental.car_rental.mapper.NotificationMapper;
import com.carrental.car_rental.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository repository;
    private final NotificationMapper mapper;

    public NotificationDTO findById(Integer id) {
        Notification entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<NotificationDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> !e.getIsDeleted())
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> findByUserId(Integer userId) {
        return repository.findByUserIdAndIsDeletedFalse(userId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public NotificationDTO save(NotificationDTO dto) {
        Notification entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }

    public NotificationDTO update(Integer id, NotificationDTO dto) {
        Notification entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found with id: " + id));
        Notification updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        updatedEntity.setIsDeleted(false);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        Notification entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }
}