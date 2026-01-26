package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.CarConditionReportDTO;
import com.carrental.car_rental.dto.CreateCarConditionReportDTO;
import com.carrental.car_rental.dto.CarConditionImageDTO;
import com.carrental.car_rental.entity.CarConditionReport;
import com.carrental.car_rental.entity.CarConditionImage;
import com.carrental.car_rental.repository.CarConditionReportRepository;
import com.carrental.car_rental.repository.CarConditionImageRepository;
// Remove StatusRepository since we're not using Status entity anymore
// import com.carrental.car_rental.repository.StatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CarConditionReportService {

    private final CarConditionReportRepository reportRepository;
    private final CarConditionImageRepository imageRepository;
    // Remove StatusRepository dependency since we're not using Status entity anymore
    // private final StatusRepository statusRepository;
    // TODO: Add BookingService injection for status updates
    // private final BookingService bookingService;

    @Transactional
    public CarConditionReportDTO createReport(CreateCarConditionReportDTO dto, List<MultipartFile> images) throws IOException {
        // Kiểm tra xem đã có báo cáo cho booking và loại này chưa
        Optional<CarConditionReport> existingReport = reportRepository
            .findByBookingAndType(dto.getBookingId(), dto.getReportType());
        
        if (existingReport.isPresent() && !existingReport.get().getIsDeleted()) {
            throw new RuntimeException("Báo cáo cho booking này và loại " + dto.getReportType() + " đã tồn tại");
        }

        // Tạo báo cáo mới
        CarConditionReport report = new CarConditionReport();
        BeanUtils.copyProperties(dto, report);
        report.setReportDate(LocalDateTime.now());
        report.setCreatedAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());
        
        // Set default status to pending using isConfirmed boolean instead of Status entity
        report.setIsConfirmed(false); // false = pending, true = confirmed
        
        CarConditionReport savedReport = reportRepository.save(report);

        // Lưu ảnh nếu có
        if (images != null && !images.isEmpty()) {
            for (int i = 0; i < images.size(); i++) {
                MultipartFile file = images.get(i);
                if (!file.isEmpty()) {
                    String imageUrl = saveFile(file);
                    
                    CarConditionImage image = new CarConditionImage();
                    image.setReport(savedReport);
                    image.setImageUrl(imageUrl);
                    
                    // Lấy thông tin mô tả từ DTO nếu có
                    if (dto.getImageDescriptions() != null && i < dto.getImageDescriptions().size()) {
                        CreateCarConditionReportDTO.ImageUploadDTO imageDto = dto.getImageDescriptions().get(i);
                        image.setImageType(imageDto.getImageType());
                        image.setDescription(imageDto.getDescription());
                    }
                    
                    image.setUploadDate(LocalDateTime.now());
                    imageRepository.save(image);
                }
            }
        }

        return convertToDTO(savedReport);
    }

    public List<CarConditionReportDTO> getReportsByBooking(Long bookingId) {
        List<CarConditionReport> reports = reportRepository.findByBookingIdAndIsDeletedFalse(bookingId);
        return reports.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<CarConditionReportDTO> getReportByBookingAndType(Long bookingId, CarConditionReport.ReportType reportType) {
        Optional<CarConditionReport> report = reportRepository.findByBookingAndType(bookingId, reportType);
        return report.map(this::convertToDTO);
    }

    public List<CarConditionReportDTO> getReportsByCar(Long carId) {
        List<CarConditionReport> reports = reportRepository.findByCarIdAndIsDeletedFalse(carId);
        return reports.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CarConditionReportDTO> getReportsByReporter(Long reporterId) {
        List<CarConditionReport> reports = reportRepository.findByReporterIdAndIsDeletedFalse(reporterId);
        return reports.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CarConditionReportDTO confirmReport(Long reportId, Long confirmedBy) {
        CarConditionReport report = reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo với ID: " + reportId));
        
        report.setIsConfirmed(true);
        report.setConfirmedBy(confirmedBy);
        report.setConfirmedAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());
        
        // Update booking status based on report type
        Long bookingId = report.getBookingId();
        if (bookingId != null) {
            // TODO: Implement booking status update logic
            // updateBookingStatusOnReportConfirm(bookingId, report.getReportType());
            System.out.println("TODO: Update booking " + bookingId + " status after " + report.getReportType() + " report confirmation");
        }
        
        CarConditionReport savedReport = reportRepository.save(report);
        return convertToDTO(savedReport);
    }

    @Transactional
    public CarConditionReportDTO disputeReport(Long reportId, Long disputedBy, String disputeReason) {
        CarConditionReport report = reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo với ID: " + reportId));
        
        // Check if report is already confirmed
        if (Boolean.TRUE.equals(report.getIsConfirmed())) {
            throw new RuntimeException("Không thể tranh chấp báo cáo đã được xác nhận");
        }
        
        // Note: Dispute functionality is not implemented in the entity yet
        // For now, we'll just update the additional notes with dispute information
        String currentNotes = report.getAdditionalNotes() != null ? report.getAdditionalNotes() : "";
        String disputeNote = String.format("\n[DISPUTE] Disputed by %d at %s. Reason: %s", 
            disputedBy, LocalDateTime.now(), disputeReason);
        report.setAdditionalNotes(currentNotes + disputeNote);
        report.setUpdatedAt(LocalDateTime.now());
        
        CarConditionReport savedReport = reportRepository.save(report);
        return convertToDTO(savedReport);
    }
    
    // TODO: Implement booking status update logic
    /*
    private void updateBookingStatusOnReportConfirm(Long bookingId, CarConditionReport.ReportType reportType) {
        // This method would call BookingService to update status
        // For pickup report confirmation: delivered -> in_progress  
        // For return report confirmation: in_progress -> completed
        try {
            if (reportType == CarConditionReport.ReportType.PICKUP) {
                // Update booking status to in_progress after pickup report is confirmed
                bookingService.updateBookingStatus(bookingId, "in_progress");
            } else if (reportType == CarConditionReport.ReportType.RETURN) {
                // Update booking status to completed after return report is confirmed  
                bookingService.updateBookingStatus(bookingId, "completed");
            }
        } catch (Exception e) {
            // Log error but don't fail the confirmation
            System.err.println("Failed to update booking status after report confirmation: " + e.getMessage());
        }
    }
    */

    @Transactional
    public CarConditionReportDTO updateReport(Long reportId, CreateCarConditionReportDTO dto) {
        CarConditionReport report = reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo với ID: " + reportId));
        
        // Cập nhật thông tin báo cáo
        report.setFuelLevel(dto.getFuelLevel());
        report.setMileage(dto.getMileage());
        report.setExteriorCondition(dto.getExteriorCondition());
        report.setInteriorCondition(dto.getInteriorCondition());
        report.setEngineCondition(dto.getEngineCondition());
        report.setTireCondition(dto.getTireCondition());
        report.setDamageNotes(dto.getDamageNotes());
        report.setAdditionalNotes(dto.getAdditionalNotes());
        report.setUpdatedAt(LocalDateTime.now());
        
        CarConditionReport savedReport = reportRepository.save(report);
        return convertToDTO(savedReport);
    }

    @Transactional
    public void deleteReport(Long reportId) {
        CarConditionReport report = reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo với ID: " + reportId));
        
        report.setIsDeleted(true);
        report.setUpdatedAt(LocalDateTime.now());
        reportRepository.save(report);
    }

    public List<CarConditionReportDTO> getPendingReports() {
        List<CarConditionReport> reports = reportRepository.findByIsConfirmedFalseAndIsDeletedFalse();
        return reports.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private String saveFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) return null;
        
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String uploadDir = new File("uploads").getAbsolutePath();
        File dest = new File(uploadDir, filename);
        
        System.out.println("Saving file to: " + dest.getAbsolutePath());
        dest.getParentFile().mkdirs();
        file.transferTo(dest);
        
        return "uploads/" + filename;
    }

    private CarConditionReportDTO convertToDTO(CarConditionReport report) {
        CarConditionReportDTO dto = new CarConditionReportDTO();
        BeanUtils.copyProperties(report, dto);
        
        // Use statusId directly instead of Status entity relationship
        dto.setStatusId(report.getStatusId());
        // Map status ID to status name (1=pending, 2=confirmed, etc.)
        switch (report.getStatusId()) {
            case 1:
                dto.setStatusName("pending");
                break;
            case 2:
                dto.setStatusName("confirmed");
                break;
            default:
                dto.setStatusName("unknown");
                break;
        }
        
        // Lấy danh sách ảnh
        try {
            List<CarConditionImage> images = imageRepository.findByReportReportIdAndIsDeletedFalse(report.getReportId());
            List<CarConditionImageDTO> imageDTOs = images.stream()
                    .map(this::convertImageToDTO)
                    .collect(Collectors.toList());
            dto.setImages(imageDTOs);
        } catch (Exception e) {
            System.err.println("Error loading images for report " + report.getReportId() + ": " + e.getMessage());
            dto.setImages(java.util.Collections.emptyList()); // Set empty list on error
        }
        
        return dto;
    }

    private CarConditionImageDTO convertImageToDTO(CarConditionImage image) {
        CarConditionImageDTO dto = new CarConditionImageDTO();
        BeanUtils.copyProperties(image, dto);
        dto.setReportId(image.getReport().getReportId());
        return dto;
    }

    private String getStatusName(Integer statusId) {
        if (statusId == null) return "unknown";
        switch (statusId) {
            case 1:
                return "pending";
            case 2:
                return "confirmed";
            default:
                return "unknown";
        }
    }

    public byte[] exportReportsToExcel(String status, String fromDate, String toDate) {
        List<CarConditionReport> reports = reportRepository.findAll(); // Có thể filter theo status, date nếu cần
    
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Reports");
            int rowIdx = 0;
    
            // Header
            Row header = sheet.createRow(rowIdx++);
            String[] columns = {"ID", "Booking ID", "Car ID", "Reporter ID", "Type", "Status", "Report Date", "Confirmed", "Notes"};
            for (int i = 0; i < columns.length; i++) {
                header.createCell(i).setCellValue(columns[i]);
            }
    
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    
            // Data
            for (CarConditionReport r : reports) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(r.getReportId());
                row.createCell(1).setCellValue(r.getBookingId());
                row.createCell(2).setCellValue(r.getCarId());
                row.createCell(3).setCellValue(r.getReporterId());
                row.createCell(4).setCellValue(r.getReportType() != null ? r.getReportType().name() : "");
                row.createCell(5).setCellValue(getStatusName(r.getStatusId()));
                row.createCell(6).setCellValue(r.getReportDate() != null ? r.getReportDate().format(dtf) : "");
                row.createCell(7).setCellValue(r.getIsConfirmed() != null && r.getIsConfirmed() ? "Yes" : "No");
                row.createCell(8).setCellValue(r.getAdditionalNotes() != null ? r.getAdditionalNotes() : "");
            }
    
            // Autosize columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }
    
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xuất Excel: " + e.getMessage(), e);
        }
    }
    public List<CarConditionReportDTO> getAllReports() {
        try {
            return reportRepository.findAll().stream()
                    .filter(r -> !Boolean.TRUE.equals(r.getIsDeleted()))
                    .map(this::convertToDTO)
                    .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error in getAllReports: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi lấy danh sách báo cáo: " + e.getMessage());
        }
    }

    public Map<String, Object> getReportStats() {
        try {
            List<CarConditionReport> all = reportRepository.findAll();
            
            // Count confirmed vs pending reports using statusId
            long confirmedCount = all.stream()
                .filter(r -> !Boolean.TRUE.equals(r.getIsDeleted()))
                .filter(r -> r.getStatusId() == 2) // 2 = confirmed
                .count();
                
            long pendingCount = all.stream()
                .filter(r -> !Boolean.TRUE.equals(r.getIsDeleted()))
                .filter(r -> r.getStatusId() == 1) // 1 = pending
                .count();
            
            Map<String, Long> statusCounts = new HashMap<>();
            statusCounts.put("confirmed", confirmedCount);
            statusCounts.put("pending", pendingCount);
        
            Map<String, Long> typeCounts = all.stream()
                .filter(r -> !Boolean.TRUE.equals(r.getIsDeleted()))
                .collect(Collectors.groupingBy(
                    r -> r.getReportType() != null ? r.getReportType().name() : "unknown",
                    Collectors.counting()
                ));
        
            Map<String, Object> stats = new HashMap<>();
            stats.put("total", all.stream().filter(r -> !Boolean.TRUE.equals(r.getIsDeleted())).count());
            stats.put("statusCounts", statusCounts);
            stats.put("typeCounts", typeCounts);
            return stats;
        } catch (Exception e) {
            System.err.println("Error in getReportStats: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi lấy thống kê báo cáo: " + e.getMessage());
        }
    }
}