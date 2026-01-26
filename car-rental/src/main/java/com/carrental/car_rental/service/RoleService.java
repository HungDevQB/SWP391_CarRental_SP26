package com.carrental.car_rental.service;
import com.carrental.car_rental.dto.RoleDTO;
import com.carrental.car_rental.entity.Role;
import com.carrental.car_rental.mapper.RoleMapper;
import com.carrental.car_rental.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {
    private final RoleRepository repository;
    private final RoleMapper mapper;

    public RoleDTO findById(Integer id) {
        Role entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found with id: " + id));
        return mapper.toDTO(entity);
    }

    public List<RoleDTO> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public RoleDTO save(RoleDTO dto) {
        Role entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    public RoleDTO update(Integer id, RoleDTO dto) {
        Role entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found with id: " + id));
        Role updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        return mapper.toDTO(repository.save(updatedEntity));
    }

    public void delete(Integer id) {
        Role entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found with id: " + id));
        repository.delete(entity);
    }

    @org.springframework.cache.annotation.Cacheable("roles")
    public Role findOrCreateCustomerRole() {
        return repository.findByRoleName("ROLE_CUSTOMER")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setRoleName("ROLE_CUSTOMER");
                    return repository.save(role);
                });
    }
}