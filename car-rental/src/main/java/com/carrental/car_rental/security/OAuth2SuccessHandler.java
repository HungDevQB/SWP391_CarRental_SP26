package com.carrental.car_rental.security;

import com.carrental.car_rental.dto.AuthResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2SuccessHandler.class);

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        try {
            CustomOAuth2User customOAuth2User = (CustomOAuth2User) authentication.getPrincipal();
            String username = customOAuth2User.getAttribute("email");
            AuthResponse authResponse = customOAuth2User.getAuthResponse();

            // Redirect trực tiếp đến trang home thay vì /login
            String redirectUrl = String.format(
                    "%s/?token=%s&username=%s&expiresAt=%d&role=%s",
                    frontendUrl,
                    authResponse.getToken(),
                    URLEncoder.encode(username, StandardCharsets.UTF_8),
                    authResponse.getExpiresAt(),
                    authResponse.getRole()
            );
            logger.info("Redirecting to: {}", redirectUrl);
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } catch (Exception e) {
            logger.error("OAuth2 login failed: {}", e.getMessage());
            String errorUrl = frontendUrl + "/login?error=" + URLEncoder.encode("OAuth2 login failed", StandardCharsets.UTF_8);
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }
}