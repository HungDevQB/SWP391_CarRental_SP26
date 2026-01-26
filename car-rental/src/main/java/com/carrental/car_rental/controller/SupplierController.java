package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.VehicleDTO;
import com.carrental.car_rental.dto.BookingDTO;
import com.carrental.car_rental.service.SupplierService;
import com.carrental.car_rental.service.DriverService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import com.carrental.car_rental.entity.User;

@RestController
@RequestMapping("/api/supplier")
@PreAuthorize("hasRole('SUPPLIER')")
public class SupplierController {

    private final SupplierService supplierService;
    private final DriverService driverService;

    public SupplierController(SupplierService supplierService, DriverService driverService) {
        this.supplierService = supplierService;
        this.driverService = driverService;
    }

    // Quản lý xe
    @PostMapping("/cars")
    public ResponseEntity<?> addCar(
        @RequestPart("carData") String carDataJson,
        @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return supplierService.addCar(carDataJson, images);
    }

    @PutMapping("/cars/{id}")
    public ResponseEntity<?> updateCar(@PathVariable Integer id, @Valid @RequestBody VehicleDTO vehicleDTO) {
        return supplierService.updateCar(id, vehicleDTO);
    }

    @DeleteMapping("/cars/{id}")
    public ResponseEntity<?> deleteCar(@PathVariable Integer id) {
        return supplierService.deleteCar(id);
    }

    @GetMapping("/cars")
    public ResponseEntity<?> getSupplierCars() {
        return supplierService.getSupplierCars();
    }

    @GetMapping("/insurances")
    public ResponseEntity<?> getSupplierInsurances() {
        return supplierService.getSupplierInsurances();
    }

    @GetMapping("/maintenances")
    public ResponseEntity<?> getSupplierMaintenances() {
        return supplierService.getSupplierMaintenances();
    }

    @GetMapping("/drivers")
    public ResponseEntity<?> getSupplierDrivers() {
        User supplier = supplierService.getCurrentSupplier();
        return ResponseEntity.ok(driverService.findByUserId(supplier.getId()));
    }

    @PostMapping("/drivers")
    public ResponseEntity<?> createDriver(@Valid @RequestBody com.carrental.car_rental.dto.DriverDTO driverDTO) {
        User supplier = supplierService.getCurrentSupplier();
        driverDTO.setUserId(supplier.getId());
        return ResponseEntity.status(201).body(driverService.save(driverDTO));
    }

    @PutMapping("/drivers/{id}")
    public ResponseEntity<?> updateDriver(@PathVariable Integer id, @Valid @RequestBody com.carrental.car_rental.dto.DriverDTO driverDTO) {
        User supplier = supplierService.getCurrentSupplier();
        // Kiểm tra xem driver có thuộc về supplier này không
        com.carrental.car_rental.dto.DriverDTO existingDriver = driverService.findById(id);
        if (!existingDriver.getUserId().equals(supplier.getId())) {
            return ResponseEntity.status(403).body("Không có quyền cập nhật tài xế này");
        }
        driverDTO.setUserId(supplier.getId());
        return ResponseEntity.ok(driverService.update(id, driverDTO));
    }

    @DeleteMapping("/drivers/{id}")
    public ResponseEntity<?> deleteDriver(@PathVariable Integer id) {
        User supplier = supplierService.getCurrentSupplier();
        // Kiểm tra xem driver có thuộc về supplier này không
        com.carrental.car_rental.dto.DriverDTO existingDriver = driverService.findById(id);
        if (!existingDriver.getUserId().equals(supplier.getId())) {
            return ResponseEntity.status(403).body("Không có quyền xóa tài xế này");
        }
        driverService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Quản lý đơn thuê
    @GetMapping("/bookings")
    public ResponseEntity<?> getBookings() {
        return supplierService.getBookings();
    }

    @PutMapping("/bookings/{id}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable Integer id) {
        return supplierService.confirmBooking(id);
    }

    @PutMapping("/bookings/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Integer id) {
        return supplierService.rejectBooking(id);
    }

    @PutMapping("/bookings/{id}/complete")
    public ResponseEntity<?> completeBooking(@PathVariable Integer id) {
        return supplierService.completeBooking(id);
    }

    @PutMapping("/bookings/{id}/confirm-full-payment")
    public ResponseEntity<?> confirmFullPayment(@PathVariable Integer id) {
        return supplierService.confirmFullPayment(id);
    }

    @PutMapping("/bookings/{id}/prepare")
    public ResponseEntity<?> prepareCar(@PathVariable Integer id) {
        return supplierService.prepareCar(id);
    }

    @PutMapping("/bookings/{id}/supplier-delivery-confirm")
    public ResponseEntity<?> supplierDeliveryConfirm(@PathVariable Integer id) {
        return supplierService.supplierDeliveryConfirm(id);
    }

    // Dashboard
    @GetMapping("/dashboard/summary")
    public ResponseEntity<?> getDashboardSummary() {
        return supplierService.getDashboardSummary();
    }

    @GetMapping("/dashboard/recent-bookings")
    public ResponseEntity<?> getRecentBookings() {
        return supplierService.getRecentBookings();
    }

    @GetMapping("/dashboard/monthly-stats")
    public ResponseEntity<?> getMonthlyStats() {
        return supplierService.getMonthlyStats();
    }
} 