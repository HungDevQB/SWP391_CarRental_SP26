package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.CarDTO;
import com.carrental.car_rental.dto.ImageDTO;
import com.carrental.car_rental.dto.ReportDTO;
import com.carrental.car_rental.entity.BookingFinancial;
import com.carrental.car_rental.repository.BookingFinancialsRepository;
import com.carrental.car_rental.repository.BookingRepository;
import com.carrental.car_rental.repository.CarRepository;
import com.carrental.car_rental.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private BookingFinancialsRepository bookingFinancialsRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private UserRepository userRepository;

    public ReportDTO getOverviewReport() {
        ReportDTO report = new ReportDTO();

        // Tổng doanh thu
        BigDecimal totalRevenue = bookingFinancialsRepository.findAll()
                .stream()
                .filter(bf -> !bf.getIsDeleted())
                .map(BookingFinancial::getTotalFare)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        report.setTotalRevenue(totalRevenue);

        // Tổng số lượt đặt
        Long totalBookings = bookingRepository.findAllByIsDeletedFalse()
                .stream()
                .count();
        report.setTotalBookings(totalBookings);

        // Xe phổ biến nhất với thông tin chi tiết
        ReportDTO.PopularCarDetailDTO popularCarDetail = bookingRepository.findAllByIsDeletedFalse()
                .stream()
                .collect(Collectors.groupingBy(b -> b.getCar().getId(), Collectors.counting()))
                .entrySet()
                .stream()
                .max((e1, e2) -> Long.compare(e1.getValue(), e2.getValue()))
                .flatMap(e -> {
                    Integer carId = e.getKey();
                    Long bookingCount = e.getValue();
                    
                    return carRepository.findByIdWithRelations(carId)
                            .map(c -> {
                                ReportDTO.PopularCarDetailDTO detail = new ReportDTO.PopularCarDetailDTO();
                                detail.setCarId(c.getId().longValue());
                                detail.setCarModel(c.getModel());
                                detail.setLicensePlate(c.getLicensePlate());
                                detail.setBrandName(c.getBrand() != null ? c.getBrand().getBrandName() : "N/A");
                                detail.setImageUrl(c.getImage()); // URL hình ảnh chính
                                detail.setBookingCount(bookingCount);
                                
                                // Lấy tên chủ xe
                                if (c.getSupplier() != null) {
                                    userRepository.findById(c.getSupplier().getId())
                                            .ifPresent(u -> detail.setSupplierName(u.getUsername()));
                                } else {
                                    detail.setSupplierName("N/A");
                                }
                                
                                // Tính tổng doanh thu của xe này
                                BigDecimal carRevenue = bookingRepository.findAllByIsDeletedFalse()
                                        .stream()
                                        .filter(b -> b.getCar().getId().equals(carId))
                                        .map(b -> bookingFinancialsRepository.findByBookingIdAndIsDeletedFalse(b.getId())
                                                .stream()
                                                .findFirst()
                                                .map(BookingFinancial::getTotalFare)
                                                .orElse(BigDecimal.ZERO))
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                                detail.setTotalRevenue(carRevenue);
                                
                                return detail;
                            });
                })
                .orElse(null);
        report.setPopularCarDetail(popularCarDetail);

        // Doanh thu nhà cung cấp
        List<ReportDTO.SupplierRevenueDTO> suppliersRevenue = bookingRepository.findAllByIsDeletedFalse()
                .stream()
                .collect(Collectors.groupingBy(
                        b -> b.getCar().getSupplier().getId(),
                        Collectors.mapping(
                                b -> bookingFinancialsRepository.findByBookingIdAndIsDeletedFalse(b.getId())
                                        .stream()
                                        .findFirst()
                                        .map(BookingFinancial::getTotalFare)
                                        .orElse(BigDecimal.ZERO),
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                        )
                ))
                .entrySet()
                .stream()
                .map(e -> {
                    ReportDTO.SupplierRevenueDTO dto = new ReportDTO.SupplierRevenueDTO();
                    userRepository.findById(e.getKey()).ifPresent(u -> dto.setSupplierName(u.getUsername()));
                    dto.setRevenue(e.getValue());
                    return dto;
                })
                .collect(Collectors.toList());
        report.setSuppliersRevenue(suppliersRevenue);

        // Doanh thu và lượt đặt hàng tháng
        LocalDate oneYearAgo = LocalDate.now().minusYears(1); // Hoặc LocalDate.of(2025, 1, 1)
        List<ReportDTO.MonthlyDataDTO> monthlyRevenue = bookingRepository.findAllByIsDeletedFalse()
                .stream()
                .filter(b -> b.getBookingDate().atZone(ZoneId.systemDefault()).toLocalDate().isAfter(oneYearAgo))
                .collect(Collectors.groupingBy(
                        b -> b.getBookingDate().atZone(ZoneId.systemDefault()).getMonthValue(),
                        Collectors.mapping(
                                b -> bookingFinancialsRepository.findByBookingIdAndIsDeletedFalse(b.getId())
                                        .stream()
                                        .findFirst()
                                        .map(BookingFinancial::getTotalFare)
                                        .orElse(BigDecimal.ZERO),
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                        )
                ))
                .entrySet()
                .stream()
                .map(e -> {
                    ReportDTO.MonthlyDataDTO dto = new ReportDTO.MonthlyDataDTO();
                    dto.setMonth(e.getKey());
                    dto.setRevenue(e.getValue());
                    return dto;
                })
                .collect(Collectors.toList());

        List<ReportDTO.MonthlyDataDTO> monthlyBookings = bookingRepository.findAllByIsDeletedFalse()
                .stream()
                .filter(b -> b.getBookingDate().atZone(ZoneId.systemDefault()).toLocalDate().isAfter(oneYearAgo))
                .collect(Collectors.groupingBy(
                        b -> b.getBookingDate().atZone(ZoneId.systemDefault()).getMonthValue(),
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .map(e -> {
                    ReportDTO.MonthlyDataDTO dto = new ReportDTO.MonthlyDataDTO();
                    dto.setMonth(e.getKey());
                    dto.setCount(e.getValue());
                    return dto;
                })
                .collect(Collectors.toList());

        report.setMonthlyRevenue(monthlyRevenue);
        report.setMonthlyBookings(monthlyBookings);

        // Tỷ lệ xe phổ biến hàng tháng
        List<ReportDTO.MonthlyPopularCarDTO> monthlyPopularCar = bookingRepository.findAllByIsDeletedFalse()
                .stream()
                .filter(b -> b.getBookingDate().atZone(ZoneId.systemDefault()).toLocalDate().isAfter(oneYearAgo))
                .collect(Collectors.groupingBy(
                        b -> b.getBookingDate().atZone(ZoneId.systemDefault()).getMonthValue(),
                        Collectors.groupingBy(
                                b -> b.getCar().getId(),
                                Collectors.counting()
                        )
                ))
                .entrySet()
                .stream()
                .map(e -> {
                    Long totalBookingsInMonth = e.getValue().values().stream().mapToLong(Long::longValue).sum();
                    return e.getValue().entrySet().stream()
                            .max((e1, e2) -> Long.compare(e1.getValue(), e2.getValue()))
                            .map(maxEntry -> {
                                ReportDTO.MonthlyPopularCarDTO dto = new ReportDTO.MonthlyPopularCarDTO();
                                dto.setMonth(e.getKey());
                                dto.setPercentage((maxEntry.getValue() * 100.0) / totalBookingsInMonth);
                                return dto;
                            })
                            .orElse(null);
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());

        report.setMonthlyPopularCar(monthlyPopularCar);

        return report;
    }
}