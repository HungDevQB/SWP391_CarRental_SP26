package com.carrental.car_rental.service;

import com.carrental.car_rental.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class SecurityService {

    private static final Logger logger = LoggerFactory.getLogger(SecurityService.class);

    public boolean canAccessUser(Authentication authentication, Integer userId) {
        if (authentication == null || authentication.getPrincipal() == null) {
            logger.warn("Authentication hoặc principal là null khi kiểm tra quyền truy cập người dùng ID: {}", userId);
            return false;
        }
        try {
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            boolean canAccess = principal.getId().equals(userId);
            logger.debug("Kiểm tra quyền truy cập người dùng ID: {}. Kết quả: {}", userId, canAccess);
            return canAccess;
        } catch (ClassCastException e) {
            logger.error("Principal không phải là UserPrincipal khi kiểm tra quyền truy cập người dùng ID: {}. Lỗi: {}", userId, e.getMessage());
            return false;
        }
    }

    public boolean canAccessEmail(Authentication authentication, String email) {
        if (authentication == null || authentication.getPrincipal() == null || email == null) {
            logger.warn("Authentication, principal hoặc email là null khi kiểm tra quyền truy cập email: {}", email);
            return false;
        }
        try {
            boolean canAccess = authentication.getName().equals(email);
            logger.debug("Kiểm tra quyền truy cập email: {}. Kết quả: {}", email, canAccess);
            return canAccess;
        } catch (Exception e) {
            logger.error("Lỗi khi kiểm tra quyền truy cập email: {}. Lỗi: {}", email, e.getMessage());
            return false;
        }
    }

    public boolean canAccessProfile(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            logger.warn("Authentication hoặc principal là null khi kiểm tra quyền truy cập profile");
            return false;
        }
        try {
            // For profile access, we just need to check if user is authenticated
            boolean canAccess = authentication.isAuthenticated();
            logger.debug("Kiểm tra quyền truy cập profile cho user: {}. Kết quả: {}", authentication.getName(), canAccess);
            return canAccess;
        } catch (Exception e) {
            logger.error("Lỗi khi kiểm tra quyền truy cập profile cho user: {}. Lỗi: {}", authentication.getName(), e.getMessage());
            return false;
        }
    }
}