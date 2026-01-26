package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.User;
import com.carrental.car_rental.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findByUserAndIsActive(User user, boolean isActive);
    Optional<UserSession> findByTokenAndIsActive(String token, boolean isActive);
    void deleteByUser(User user);
} 