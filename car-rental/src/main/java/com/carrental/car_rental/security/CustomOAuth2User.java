package com.carrental.car_rental.security;

import com.carrental.car_rental.dto.AuthResponse;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

@Getter
public class CustomOAuth2User implements OAuth2User {

    private final OAuth2User delegate;
    private final AuthResponse authResponse;

    public CustomOAuth2User(OAuth2User delegate, AuthResponse authResponse) {
        this.delegate = delegate;
        this.authResponse = authResponse;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return delegate.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return delegate.getAuthorities();
    }

    @Override
    public String getName() {
        return delegate.getName();
    }
}