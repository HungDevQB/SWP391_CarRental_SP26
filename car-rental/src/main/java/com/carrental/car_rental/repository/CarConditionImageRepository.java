package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.CarConditionImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarConditionImageRepository extends JpaRepository<CarConditionImage, Long> {
    
    List<CarConditionImage> findByReportReportIdAndIsDeletedFalse(Long reportId);
    
    List<CarConditionImage> findByImageTypeAndIsDeletedFalse(String imageType);
    
    void deleteByReportReportId(Long reportId);
}