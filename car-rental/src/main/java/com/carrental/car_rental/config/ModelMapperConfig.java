package com.carrental.car_rental.config;

import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();

        // Converter: Instant -> LocalDateTime
        Converter<Instant, LocalDateTime> instantToLocalDateTime = ctx ->
                ctx.getSource() != null ? LocalDateTime.ofInstant(ctx.getSource(), ZoneId.of("UTC")) : null;
        Converter<LocalDateTime, Instant> localDateTimeToInstant = ctx ->
                ctx.getSource() != null ? ctx.getSource().atZone(ZoneId.of("UTC")).toInstant() : null;

        return modelMapper;
    }
}