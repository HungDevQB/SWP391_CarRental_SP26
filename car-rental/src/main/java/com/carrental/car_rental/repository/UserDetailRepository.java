package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.UserDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserDetailRepository extends JpaRepository<UserDetail, Integer> {
    Optional<UserDetail> findByUserIdAndIsDeletedFalse(Integer userId);
}