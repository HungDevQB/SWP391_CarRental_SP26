package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.ReportDTO;
import com.carrental.car_rental.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // Lấy báo cáo tổng quan (của hoàng)
    @GetMapping("/overview")
    public ResponseEntity<ReportDTO> getOverviewReport() {
        ReportDTO report = reportService.getOverviewReport();
        return ResponseEntity.ok(report);
    }
}