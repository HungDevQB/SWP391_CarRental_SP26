package com.carrental.car_rental.service;

import com.carrental.car_rental.entity.RegistrationRequest;
import com.carrental.car_rental.repository.RegistrationRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RegistrationRequestService {
    @Autowired
    private RegistrationRequestRepository repo;

    public RegistrationRequest save(RegistrationRequest req) {
        return repo.save(req);
    }

    public List<RegistrationRequest> findAll() {
        return repo.findAll();
    }

    public Optional<RegistrationRequest> findById(Long id) {
        return repo.findById(id);
    }
} 