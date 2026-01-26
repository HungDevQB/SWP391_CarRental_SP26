package com.carrental.car_rental.service;

import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.client.RestTemplate;
import org.springframework.stereotype.Service;
import org.springframework.http.*;
import java.util.HashMap;
import java.util.Map;

@Service
public class SmsService {
    private static final String API_KEY = "da527d427e66cdbe25e2c4ee9e3185075e47ae41195b8055";
    public void sendOtp(String toPhone, String otp) {
        String sms = "Mã xác thực của bạn là: " + otp;
        String url = "https://api.smsmobileapi.com/sendsms/";
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        Map<String, String> params = new HashMap<>();
        params.put("apikey", API_KEY);
        params.put("recipients", toPhone);
        params.put("message", sms);

        StringBuilder body = new StringBuilder();
        params.forEach((k, v) -> body.append(k).append("=").append(v).append("&"));
        HttpEntity<String> request = new HttpEntity<>(body.toString(), headers);

        System.out.println("[SMS-DEBUG] Gửi OTP tới: " + toPhone + " | OTP: " + otp + " | Thời gian: " + java.time.LocalDateTime.now());
        String response = restTemplate.postForObject(url, request, String.class);
        System.out.println("[SMS-DEBUG] API response: " + response);
    }
} 