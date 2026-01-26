package com.carrental.car_rental.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MoMoConfig {
    @Value("${momo.partnerCode}")
    public String partnerCode;

    @Value("${momo.accessKey}")
    public String accessKey;

    @Value("${momo.secretKey}")
    public String secretKey;

    @Value("${momo.redirectUrl}")
    public String redirectUrl;

    @Value("${momo.ipnUrl}")
    public String ipnUrl;

    @Value("${momo.endpoint}")
    public String endpoint;
} 