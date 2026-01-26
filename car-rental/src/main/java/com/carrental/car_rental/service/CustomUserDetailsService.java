package com.carrental.car_rental.service;

import com.carrental.car_rental.repository.UserRepository;
import com.carrental.car_rental.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("Tải thông tin người dùng: {}", username);
        return userRepository.findByUsernameOrEmail(username, username)
                .map(user -> {
                    String role = user.getRole().getRoleName();
                    logger.info("User found: {}, Role from DB: {}", username, role);
                    UserPrincipal principal = new UserPrincipal(user.getId(), user.getUsername(), user.getPasswordHash(), role);
                    logger.info("UserPrincipal created with authorities: {}", principal.getAuthorities());
                    return principal;
                })
                .orElseThrow(() -> {
                    logger.error("Không tìm thấy người dùng: {}", username);
                    return new UsernameNotFoundException("Không tìm thấy người dùng: " + username);
                });
    }
}