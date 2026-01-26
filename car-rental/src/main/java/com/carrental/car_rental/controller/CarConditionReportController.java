package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.CarConditionReportDTO;
import com.carrental.car_rental.dto.CreateCarConditionReportDTO;
import com.carrental.car_rental.entity.CarConditionReport;
import com.carrental.car_rental.service.CarConditionReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/car-condition-reports")
@RequiredArgsConstructor
public class CarConditionReportController {

    private final CarConditionReportService reportService;

    @PostMapping
    public ResponseEntity<?> createReport(
            @RequestParam Long bookingId,
            @RequestParam Long carId,
            @RequestParam Long reporterId,
            @RequestParam CarConditionReport.ReportType reportType,
            @RequestParam(required = false) BigDecimal fuelLevel,
            @RequestParam(required = false) Integer mileage,
            @RequestParam(required = false) CarConditionReport.ConditionLevel exteriorCondition,
            @RequestParam(required = false) CarConditionReport.ConditionLevel interiorCondition,
            @RequestParam(required = false) CarConditionReport.ConditionLevel engineCondition,
            @RequestParam(required = false) CarConditionReport.ConditionLevel tireCondition,
            @RequestParam(required = false) String damageNotes,
            @RequestParam(required = false) String additionalNotes,
            @RequestParam(required = false) List<MultipartFile> images,
            @RequestParam(required = false) List<String> imageTypes,
            @RequestParam(required = false) List<String> imageDescriptions
    ) {
        try {
            CreateCarConditionReportDTO dto = new CreateCarConditionReportDTO();
            dto.setBookingId(bookingId);
            dto.setCarId(carId);
            dto.setReporterId(reporterId);
            dto.setReportType(reportType);
            dto.setFuelLevel(fuelLevel);
            dto.setMileage(mileage);
            dto.setExteriorCondition(exteriorCondition != null ? exteriorCondition : CarConditionReport.ConditionLevel.GOOD);
            dto.setInteriorCondition(interiorCondition != null ? interiorCondition : CarConditionReport.ConditionLevel.GOOD);
            dto.setEngineCondition(engineCondition != null ? engineCondition : CarConditionReport.ConditionLevel.GOOD);
            dto.setTireCondition(tireCondition != null ? tireCondition : CarConditionReport.ConditionLevel.GOOD);
            dto.setDamageNotes(damageNotes);
            dto.setAdditionalNotes(additionalNotes);

            // Xử lý thông tin ảnh
            if (imageTypes != null && imageDescriptions != null) {
                List<CreateCarConditionReportDTO.ImageUploadDTO> imageUploadDTOs = new java.util.ArrayList<>();
                for (int i = 0; i < Math.min(imageTypes.size(), imageDescriptions.size()); i++) {
                    CreateCarConditionReportDTO.ImageUploadDTO imageUploadDTO = new CreateCarConditionReportDTO.ImageUploadDTO();
                    imageUploadDTO.setImageType(imageTypes.get(i));
                    imageUploadDTO.setDescription(imageDescriptions.get(i));
                    imageUploadDTOs.add(imageUploadDTO);
                }
                dto.setImageDescriptions(imageUploadDTOs);
            }

            CarConditionReportDTO result = reportService.createReport(dto, images);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Lỗi khi lưu ảnh: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<CarConditionReportDTO>> getReportsByBooking(@PathVariable Long bookingId) {
        List<CarConditionReportDTO> reports = reportService.getReportsByBooking(bookingId);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/booking/{bookingId}/type/{reportType}")
    public ResponseEntity<?> getReportByBookingAndType(
            @PathVariable Long bookingId, 
            @PathVariable CarConditionReport.ReportType reportType) {
        Optional<CarConditionReportDTO> report = reportService.getReportByBookingAndType(bookingId, reportType);
        return report.map(ResponseEntity::ok)
                     .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/car/{carId}")
    public ResponseEntity<List<CarConditionReportDTO>> getReportsByCar(@PathVariable Long carId) {
        List<CarConditionReportDTO> reports = reportService.getReportsByCar(carId);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/reporter/{reporterId}")
    public ResponseEntity<List<CarConditionReportDTO>> getReportsByReporter(@PathVariable Long reporterId) {
        List<CarConditionReportDTO> reports = reportService.getReportsByReporter(reporterId);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<CarConditionReportDTO>> getPendingReports() {
        List<CarConditionReportDTO> reports = reportService.getPendingReports();
        return ResponseEntity.ok(reports);
    }

    @GetMapping
    public ResponseEntity<?> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String reportType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) String searchTerm
    ) {
        try {
            List<CarConditionReportDTO> allReports = reportService.getAllReports();
            
            // Simple response format for now - can add pagination later if needed
            Map<String, Object> response = Map.of(
                "reports", allReports,
                "totalElements", allReports.size(),
                "totalPages", 1,
                "currentPage", 0
            );
            
            return ResponseEntity.ok(Map.of("data", response, "success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage(), "success", false));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getReportStats() {
        try {
            Map<String, Object> stats = reportService.getReportStats();
            return ResponseEntity.ok(Map.of("data", stats, "success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage(), "success", false));
        }
    }

    @PostMapping("/{reportId}/confirm")
    public ResponseEntity<?> confirmReport(@PathVariable Long reportId) {
        try {
            // TODO: Get current user ID from authentication context
            Long confirmedBy = 1L; // Temporary - should get from SecurityContext
            CarConditionReportDTO result = reportService.confirmReport(reportId, confirmedBy);
            return ResponseEntity.ok(Map.of("data", result, "success", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage(), "success", false));
        }
    }

    @PostMapping("/{reportId}/dispute")
    public ResponseEntity<?> disputeReport(
            @PathVariable Long reportId,
            @RequestBody Map<String, String> disputeData
    ) {
        try {
            String disputeReason = disputeData.get("disputeReason");
            if (disputeReason == null || disputeReason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Lý do tranh chấp không được để trống", "success", false));
            }
            
            // TODO: Get current user ID from authentication context
            Long disputedBy = 1L; // Temporary - should get from SecurityContext
            CarConditionReportDTO result = reportService.disputeReport(reportId, disputedBy, disputeReason);
            return ResponseEntity.ok(Map.of("data", result, "success", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage(), "success", false));
        }
    }

    @PutMapping("/{reportId}")
    public ResponseEntity<?> updateReport(@PathVariable Long reportId, @RequestBody CreateCarConditionReportDTO dto) {
        try {
            CarConditionReportDTO result = reportService.updateReport(reportId, dto);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<?> deleteReport(@PathVariable Long reportId) {
        try {
            reportService.deleteReport(reportId);
            return ResponseEntity.ok("Đã xóa báo cáo thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/export")
    public ResponseEntity<Resource> exportReports(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate
    ) {
        byte[] excelData = reportService.exportReportsToExcel(status, fromDate, toDate);
        ByteArrayResource resource = new ByteArrayResource(excelData);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=car-condition-reports.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(resource);
    }
}