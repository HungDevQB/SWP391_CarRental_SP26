package com.carrental.car_rental.security;

import com.carrental.car_rental.config.JwtTokenProvider;
import com.carrental.car_rental.service.CustomUserDetailsService;
import com.carrental.car_rental.service.UserSessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
            // WebSocket endpoints (SockJS handshake, info, etc.)
            "/ws-chat", "/ws-chat/", "/ws-chat/info", "/ws-chat/info/", "/ws-chat/**",
            "/login/oauth2/code/",
            "/oauth2/authorization/",
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/check-email",
            "/api/languages/",
            "/api/country-codes/",
            "/api/car-brands/",
            "/api/fuel-types/",
            "/api/regions/",
            "/api/service-types/",

            "/api/ratings/",
            "/api/payments/callback",
            "/api/payments/momo-callback",
            "/api/registration-requests",
            "/api/registration-requests/",
            "/uploads/"
    );
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
    @Autowired
    private UserSessionService userSessionService;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, CustomUserDetailsService userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        logger.info("Request path: {}", path);
        String method = request.getMethod();

        // So sánh chính xác endpoint hoặc bắt đầu bằng prefix
        boolean isPublicEndpoint = PUBLIC_ENDPOINTS.stream()
            .anyMatch(publicPath -> path.equals(publicPath) || path.startsWith(publicPath));
        boolean isGetRestrictedEndpoint = (path.startsWith("/api/ratings/"))
                && "GET".equalsIgnoreCase(method);

        logger.info("Path: {}, isPublicEndpoint: {}, isGetRestrictedEndpoint: {}", path, isPublicEndpoint, isGetRestrictedEndpoint);

        if (isPublicEndpoint) {
            logger.info("Allowing public access to: {}", path);
            filterChain.doFilter(request, response);
            return;
        }

        String token = getJwtFromRequest(request);
        if (token != null && jwtTokenProvider.validateToken(token)) {
            logger.info("Valid JWT token found for request: {}", path);
            String username = jwtTokenProvider.getUsernameFromToken(token);
            String role = jwtTokenProvider.getRoleFromToken(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } else if (token != null) {
            logger.debug("No valid JWT token found for request: {}", path);
        }
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}