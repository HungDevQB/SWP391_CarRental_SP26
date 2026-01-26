package com.carrental.car_rental.scheduler;

import com.carrental.car_rental.service.CashPaymentManagementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled jobs for Platform Fee Management
 */
@Component
public class PlatformFeeScheduler {
    
    private static final Logger logger = LoggerFactory.getLogger(PlatformFeeScheduler.class);
    
    private final CashPaymentManagementService cashPaymentService;
    
    public PlatformFeeScheduler(CashPaymentManagementService cashPaymentService) {
        this.cashPaymentService = cashPaymentService;
    }
    
    /**
     * Chạy hàng ngày lúc 2:00 AM để đánh dấu platform fees quá hạn
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void markOverduePlatformFees() {
        logger.info("Starting scheduled job: Mark overdue platform fees");
        
        try {
            cashPaymentService.markOverduePlatformFees();
            logger.info("Completed scheduled job: Mark overdue platform fees");
        } catch (Exception e) {
            logger.error("Error in scheduled job: Mark overdue platform fees", e);
        }
    }
    
    /**
     * Chạy mỗi 4 tiếng để log thống kê platform fees
     */
    @Scheduled(fixedRate = 4 * 60 * 60 * 1000) // 4 hours
    public void logPlatformFeeStatistics() {
        logger.info("Platform fee statistics logging - this can be extended with actual statistics");
        // Có thể thêm logic để log statistics, gửi email notifications, etc.
    }
}
