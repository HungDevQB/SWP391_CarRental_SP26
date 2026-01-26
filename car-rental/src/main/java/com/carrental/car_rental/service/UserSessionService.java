package com.carrental.car_rental.service;

import com.carrental.car_rental.entity.User;
import com.carrental.car_rental.entity.UserSession;
import com.carrental.car_rental.repository.UserSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Service
public class UserSessionService {
    @Autowired
    private UserSessionRepository userSessionRepository;

    public void createOrUpdateSession(User user, String token, Timestamp expiredAt) {
        // Xóa/vô hiệu hóa session cũ
        userSessionRepository.deleteByUser(user);
        // Hoặc: userSessionRepository.findByUserAndIsActive(user, true).ifPresent(s -> { s.setIsActive(false); userSessionRepository.save(s); });

        // Tạo session mới
        UserSession session = new UserSession();
        session.setUser(user);
        session.setToken(token);
        session.setExpiredAt(expiredAt);
        session.setIsActive(true);
        userSessionRepository.save(session);
    }

    public boolean isTokenValid(String token) {
        Optional<UserSession> sessionOpt = userSessionRepository.findByTokenAndIsActive(token, true);
        return sessionOpt.isPresent();
    }

    public void invalidateSessionByToken(String token) {
        userSessionRepository.findByTokenAndIsActive(token, true).ifPresent(session -> {
            session.setIsActive(false);
            userSessionRepository.save(session);
        });
    }

    public void invalidateAllSessionsForUser(User user) {
        userSessionRepository.deleteByUser(user);
    }

    public boolean hasActiveSession(User user) {
        Optional<UserSession> sessionOpt = userSessionRepository.findByUserAndIsActive(user, true);
        if (sessionOpt.isPresent()) {
            UserSession session = sessionOpt.get();
            Timestamp now = new Timestamp(System.currentTimeMillis());
            // Kiểm tra xem session có hết hạn chưa
            if (session.getExpiredAt().before(now)) {
                // Session đã hết hạn, vô hiệu hóa nó
                session.setIsActive(false);
                userSessionRepository.save(session);
                return false;
            }
            return true;
        }
        return false;
    }

    public void invalidateSessionByUser(User user) {
        userSessionRepository.findByUserAndIsActive(user, true).ifPresent(session -> {
            session.setIsActive(false);
            userSessionRepository.save(session);
        });
    }

    public void deactivateExpiredSessions(User user) {
        Optional<UserSession> sessionOpt = userSessionRepository.findByUserAndIsActive(user, true);
        Timestamp now = new Timestamp(System.currentTimeMillis());
        sessionOpt.ifPresent(session -> {
            if (session.getExpiredAt().before(now)) {
                session.setIsActive(false);
                userSessionRepository.save(session);
            }
        });
    }
} 