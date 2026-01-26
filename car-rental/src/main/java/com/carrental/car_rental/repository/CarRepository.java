package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.Car;
import com.carrental.car_rental.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarRepository extends JpaRepository<Car, Integer>, JpaSpecificationExecutor<Car> {
    @Query("SELECT c FROM Rating r " +
        "JOIN r.car c " +
        "WHERE c.isDeleted = false AND c.status.id = 11 AND r.isDeleted = false " +
        "GROUP BY c " +
        "ORDER BY AVG(r.ratingScore) DESC")
    Page<Car> findFeaturedCars(Pageable pageable);

    @Query("SELECT c FROM Booking b " +
        "JOIN b.car c " +
        "WHERE c.isDeleted = false AND c.status.id = 11 " +
        "GROUP BY c " +
        "ORDER BY COUNT(b.id) DESC")
    Page<Car> findPopularCars(Pageable pageable);

    @Query("SELECT c FROM Car c JOIN FETCH c.brand JOIN FETCH c.fuelType JOIN FETCH c.region JOIN FETCH c.status WHERE c.isDeleted = false")
    Page<Car> searchCars(Pageable pageable);

    @Query("SELECT c FROM Car c JOIN FETCH c.brand JOIN FETCH c.fuelType JOIN FETCH c.region JOIN FETCH c.status WHERE c.isDeleted = false")
    List<Car> findAllWithRelations();

    @Query("SELECT c FROM Car c JOIN FETCH c.brand JOIN FETCH c.fuelType JOIN FETCH c.region JOIN FETCH c.status WHERE c.supplier.id = :supplierId AND c.isDeleted = false")
    List<Car> findBySupplierIdAndIsDeletedFalse(Integer supplierId);

    @Query("SELECT c FROM Car c JOIN FETCH c.brand JOIN FETCH c.fuelType JOIN FETCH c.region JOIN FETCH c.status WHERE c.brand.id = :brandId AND c.isDeleted = false")
    List<Car> findByBrand_IdAndIsDeletedFalse(Integer brandId);

    @Query("SELECT c FROM Car c JOIN FETCH c.brand JOIN FETCH c.fuelType JOIN FETCH c.region JOIN FETCH c.status WHERE c.fuelType.id = :fuelTypeId AND c.isDeleted = false")
    List<Car> findByFuelTypeIdAndIsDeletedFalse(Integer fuelTypeId);

    @Query("SELECT c FROM Car c JOIN FETCH c.brand JOIN FETCH c.fuelType JOIN FETCH c.region JOIN FETCH c.status WHERE c.status.id = :statusId AND c.isDeleted = false")
    List<Car> findByStatusIdAndIsDeletedFalse(Integer statusId);

    @Query(value = "EXEC sp_GetAvailableCars :startDate, :endDate", nativeQuery = true)
    List<Car> findAvailableCars(Instant startDate, Instant endDate);

    @Query("SELECT c FROM Car c JOIN FETCH c.supplier s LEFT JOIN FETCH s.userDetail JOIN FETCH c.brand JOIN FETCH c.fuelType JOIN FETCH c.region JOIN FETCH c.status LEFT JOIN FETCH c.images i WHERE c.id = :id AND c.isDeleted = false AND (i.isDeleted = false OR i.isDeleted IS NULL)")
    Optional<Car> findByIdWithRelations(@Param("id") Integer id);

    @Query("SELECT c FROM Car c JOIN FETCH c.supplier JOIN FETCH c.brand JOIN FETCH c.fuelType JOIN FETCH c.region JOIN FETCH c.status WHERE c.isDeleted = false")
    Page<Car> findAllWithRelations(Pageable pageable);
    @Query("SELECT c FROM Car c JOIN FETCH c.brand JOIN FETCH c.fuelType JOIN FETCH c.region JOIN FETCH c.status WHERE c.region.id = :regionId AND c.isDeleted = false")
    List<Car> findByRegionIdAndIsDeletedFalse(Integer regionId);

    @Query("SELECT c FROM Car c " +
            "JOIN FETCH c.brand " +
            "WHERE c.brand.id = :brandId " +
            "AND c.id != :carId " +
            "AND c.status.id = 11 " +
            "AND c.isDeleted = false")
    Page<Car> findSimilarCars(
            @Param("brandId") Integer brandId,
            @Param("carId") Integer carId,
            Pageable pageable
    );

    @Query("SELECT c FROM Car c " +
            "JOIN FETCH c.brand " +
            "JOIN FETCH c.fuelType " +
            "JOIN FETCH c.region " +
            "JOIN FETCH c.status " +
            "WHERE c.brand.id = :brandId " +
            "AND c.id != :carId " +
            "AND c.isDeleted = false")
    Page<Car> findByBrand_IdAndIsDeletedFalseAndIdNot(
            @Param("brandId") Integer brandId,
            @Param("carId") Integer carId,
            Pageable pageable
    );

    @Query("SELECT c FROM Car c " +
            "JOIN FETCH c.brand " +
            "JOIN FETCH c.fuelType " +
            "JOIN FETCH c.region " +
            "JOIN FETCH c.status " +
            "WHERE c.region.id = :regionId " +
            "AND c.id != :carId " +
            "AND c.isDeleted = false")
    Page<Car> findByRegion_IdAndIsDeletedFalseAndIdNot(
            @Param("regionId") Integer regionId,
            @Param("carId") Integer carId,
            Pageable pageable
    );

    @Query("SELECT c FROM Car c " +
            "JOIN FETCH c.brand " +
            "JOIN FETCH c.fuelType " +
            "JOIN FETCH c.region " +
            "JOIN FETCH c.status " +
            "WHERE c.fuelType.id = :fuelTypeId " +
            "AND c.id != :carId " +
            "AND c.isDeleted = false")
    Page<Car> findByFuelType_IdAndIsDeletedFalseAndIdNot(
            @Param("fuelTypeId") Integer fuelTypeId,
            @Param("carId") Integer carId,
            Pageable pageable
    );

    @Query("SELECT c FROM Car c " +
            "JOIN FETCH c.brand " +
            "JOIN FETCH c.fuelType " +
            "JOIN FETCH c.region " +
            "JOIN FETCH c.status " +
            "WHERE c.id != :carId " +
            "AND c.isDeleted = false")
    Page<Car> findByIdNotAndIsDeletedFalse(
            @Param("carId") Integer carId,
            Pageable pageable
    );

    long countBySupplierAndIsDeletedFalse(User supplier);

    @Query("SELECT COUNT(c) FROM Car c WHERE c.supplier = :supplier AND c.status.statusName = :status AND c.isDeleted = false")
    long countBySupplierAndStatusAndIsDeletedFalse(@Param("supplier") User supplier, @Param("status") String status);

    Optional<Car> findByLicensePlateAndIsDeletedFalse(String licensePlate);

    List<Car> findBySupplierAndIsDeletedFalse(User supplier);

    @Query("SELECT c FROM Car c " +
           "LEFT JOIN FETCH c.supplier s " +
           "LEFT JOIN FETCH s.role " +
           "LEFT JOIN FETCH s.status " +
           "LEFT JOIN FETCH s.userDetail " +
           "LEFT JOIN FETCH c.brand " +
           "LEFT JOIN FETCH c.fuelType " +
           "LEFT JOIN FETCH c.region " +
           "LEFT JOIN FETCH c.status " +
           "LEFT JOIN FETCH c.images " +
           "WHERE c.supplier = :supplier AND c.isDeleted = false")
    List<Car> findBySupplierAndIsDeletedFalseWithAllRelations(@Param("supplier") User supplier);

    @Query("SELECT c FROM Car c " +
           "JOIN FETCH c.supplier s " +
           "LEFT JOIN FETCH s.role " +
           "LEFT JOIN FETCH s.status " +
           "LEFT JOIN FETCH s.userDetail " +
           "LEFT JOIN FETCH s.status " + // Thêm dòng này!
           "JOIN FETCH c.status st " +
           "WHERE c.status.statusName = 'pending_approval' AND c.isDeleted = false")
    List<Car> findByStatus_StatusNameAndIsDeletedFalse(@Param("statusName") String statusName);

    // Count methods for admin dashboard
    long countByIsDeletedFalse();
    
    @Query("SELECT COUNT(c) FROM Car c WHERE c.status.statusName = :statusName AND c.isDeleted = false")
    long countByStatus_StatusNameAndIsDeletedFalse(@Param("statusName") String statusName);

    // Lấy danh sách xe theo status (không phân biệt hoa thường, không bị xóa)
    List<Car> findByStatus_StatusNameIgnoreCaseAndIsDeletedFalse(String statusName);

    @Query("SELECT c FROM Car c " +
           "JOIN FETCH c.supplier s " +
           "LEFT JOIN FETCH s.role " +
           "LEFT JOIN FETCH s.userDetail " +
           "LEFT JOIN FETCH s.status " + // Thêm dòng này!
           "JOIN FETCH c.status st " +
           "LEFT JOIN FETCH c.brand " +
           "LEFT JOIN FETCH c.fuelType " +
           "LEFT JOIN FETCH c.region " +
           "LEFT JOIN FETCH c.images " +
           "WHERE UPPER(st.statusName) = UPPER(:statusName) AND c.isDeleted = false")
    List<Car> findByStatusNameWithSupplierAndRelations(@Param("statusName") String statusName);
}