package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.UserActionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserActionLogRepository extends JpaRepository<UserActionLog, Integer> {
    List<UserActionLog> findByUserIdAndIsDeletedFalse(Integer userId);
}