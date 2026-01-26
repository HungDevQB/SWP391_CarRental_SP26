package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.UserDetailDTO;
import com.carrental.car_rental.entity.User;
import com.carrental.car_rental.entity.UserDetail;
import com.carrental.car_rental.mapper.UserDetailMapper;
import com.carrental.car_rental.repository.UserDetailRepository;
import com.carrental.car_rental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailService {
    private final UserDetailRepository repository;
    private final UserDetailMapper mapper;
    private final UserRepository userRepository;

    public UserDetailDTO findById(Integer id) {
        UserDetail entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "UserDetail not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<UserDetailDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> !e.getIsDeleted())
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<UserDetailDTO> findByUserId(Integer userId) {
        return repository.findByUserIdAndIsDeletedFalse(userId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public UserDetailDTO save(UserDetailDTO dto) {
        Optional<UserDetail> entityOptional = repository.findById(dto.getUserId());
        UserDetail entity;
        if (entityOptional.isPresent()) {
            entity = entityOptional.get();
            // KHÔNG set lại id, user
        } else {
            entity = new UserDetail();
            entity.setId(dto.getUserId());
            // LẤY User đã persist để set vào UserDetail!
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found for UserDetail"));
            entity.setUser(user);
            entity.setIsDeleted(false);
            entity.setAddress(dto.getAddress() == null ? "" : dto.getAddress());
        }
        entity.setName(dto.getFullName());
        entity.setAddress(dto.getAddress());
        entity.setTaxcode(dto.getTaxcode());
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }
    public UserDetailDTO update(Integer id, UserDetailDTO dto) {
        UserDetail entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "UserDetail not found with id: " + id));
        // KHÔNG tạo object mới, chỉ update field!
        entity.setName(dto.getFullName());
        entity.setAddress(dto.getAddress());
        entity.setTaxcode(dto.getTaxcode());
        entity.setIsDeleted(false);
        return mapper.toDTO(repository.save(entity));
    }

    public void delete(Integer id) {
        UserDetail entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "UserDetail not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }
}