package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.CarConditionReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarConditionReportRepository extends JpaRepository<CarConditionReport, Long> {
    
    @Query("SELECT r FROM CarConditionReport r WHERE r.bookingId = :bookingId AND r.isDeleted = false")
    List<CarConditionReport> findByBookingIdAndIsDeletedFalse(@Param("bookingId") Long bookingId);
    
    @Query("SELECT r FROM CarConditionReport r WHERE r.carId = :carId AND r.isDeleted = false")
    List<CarConditionReport> findByCarIdAndIsDeletedFalse(@Param("carId") Long carId);
    
    @Query("SELECT r FROM CarConditionReport r WHERE r.reporterId = :reporterId AND r.isDeleted = false")
    List<CarConditionReport> findByReporterIdAndIsDeletedFalse(@Param("reporterId") Long reporterId);
    
    @Query("SELECT r FROM CarConditionReport r WHERE r.bookingId = :bookingId " +
           "AND r.reportType = :reportType AND r.isDeleted = false")
    Optional<CarConditionReport> findByBookingIdAndReportTypeAndIsDeletedFalse(
        @Param("bookingId") Long bookingId, 
        @Param("reportType") CarConditionReport.ReportType reportType);
    
    @Query("SELECT r FROM CarConditionReport r WHERE r.bookingId = :bookingId " +
           "AND r.reportType = :reportType AND r.isDeleted = false")
    Optional<CarConditionReport> findByBookingAndType(
        @Param("bookingId") Long bookingId, 
        @Param("reportType") CarConditionReport.ReportType reportType);
    
    @Query("SELECT r FROM CarConditionReport r WHERE r.isConfirmed = false AND r.isDeleted = false")
    List<CarConditionReport> findByIsConfirmedFalseAndIsDeletedFalse();
}