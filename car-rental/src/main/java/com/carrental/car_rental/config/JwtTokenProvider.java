package com.carrental.car_rental.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final String secretKey;
    private final long expirationTime;

    public JwtTokenProvider(@Value("${jwt.secret:defaultSecretKeyForJwtWhichIsLongEnough}") String secret,
                            @Value("${jwt.expiration:86400000}") long expirationTime) {
        this.secretKey = secret;
        this.expirationTime = expirationTime;
    }

    // Tạo token với username và role
    public String generateToken(String username, String role) {
        // Lưu role với prefix ROLE_ và uppercase để consistent với Spring Security
        String roleForJWT = "ROLE_" + role.toUpperCase();
        logger.info("Generating JWT for username: {}, original role: {}, JWT role: {}", username, role, roleForJWT);
        return JWT.create()
                .withSubject(username)
                .withClaim("role", roleForJWT)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + expirationTime))
                .sign(Algorithm.HMAC512(secretKey));
    }

    public String getUsernameFromToken(String token) {
        if (!validateToken(token)) {
            throw new JWTVerificationException("Invalid or expired token");
        }
        DecodedJWT jwt = JWT.decode(token);
        return jwt.getSubject();
    }

    public String getRoleFromToken(String token) {
        if (!validateToken(token)) {
            throw new JWTVerificationException("Invalid or expired token");
        }
        DecodedJWT jwt = JWT.decode(token);
        return jwt.getClaim("role").asString();
    }

    public Date getExpirationDateFromToken(String token) {
        if (!validateToken(token)) {
            throw new JWTVerificationException("Invalid or expired token");
        }
        DecodedJWT jwt = JWT.decode(token);
        return jwt.getExpiresAt();
    }

    public long getExpirationTime() {
        return expirationTime;
    }

    public boolean validateToken(String token) {
        try {
            JWT.require(Algorithm.HMAC512(secretKey))
                    .build()
                    .verify(token);
            logger.debug("Xác thực token thành công");
            return true;
        } catch (JWTVerificationException e) {
            logger.error("Xác thực token thất bại: {}", e.getMessage());
            return false;
        }
    }
}