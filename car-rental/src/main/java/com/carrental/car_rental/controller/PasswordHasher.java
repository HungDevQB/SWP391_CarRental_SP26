package com.carrental.car_rental.controller;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHasher {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "Hung@1234";
        System.out.println(encoder.encode(password));
    }
}