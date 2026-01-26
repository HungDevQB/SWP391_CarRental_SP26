package com.carrental.car_rental.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Autowired
    private WebSocketChannelInterceptor webSocketChannelInterceptor;
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple broker for chat topics
        config.enableSimpleBroker("/topic", "/queue")
              .setHeartbeatValue(new long[]{10000, 20000}) // Client heartbeat: 10s, Server heartbeat: 20s
              .setTaskScheduler(webSocketTaskScheduler());
        
        // Set application destination prefixes
        config.setApplicationDestinationPrefixes("/app");
        
        // Set user destination prefix for private messages
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*") // In production, specify exact origins
                .withSockJS()
                .setHeartbeatTime(25000) // SockJS heartbeat
                .setDisconnectDelay(30000) // Disconnect delay
                .setHttpMessageCacheSize(1000) // Cache size for HTTP messages
                .setStreamBytesLimit(128 * 1024); // 128KB limit for streaming
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
        // Configure transport limits for security and performance
        registry.setMessageSizeLimit(64 * 1024) // 64KB max message size
                .setSendBufferSizeLimit(512 * 1024) // 512KB send buffer
                .setSendTimeLimit(20 * 1000) // 20 second send timeout
                .setTimeToFirstMessage(30 * 1000); // 30 second timeout to first message
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Configure inbound channel with thread pool and interceptor
        registration.interceptors(webSocketChannelInterceptor)
                   .taskExecutor(clientInboundChannelTaskExecutor());
    }

    @Override
    public void configureClientOutboundChannel(ChannelRegistration registration) {
        // Configure outbound channel with thread pool
        registration.taskExecutor(clientOutboundChannelTaskExecutor());
    }

    @Bean
    public ThreadPoolTaskScheduler webSocketTaskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(2);
        scheduler.setThreadNamePrefix("websocket-heartbeat-");
        scheduler.initialize();
        return scheduler;
    }

    @Bean
    public ThreadPoolTaskExecutor clientInboundChannelTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("websocket-inbound-");
        executor.setKeepAliveSeconds(60);
        executor.initialize();
        return executor;
    }

    @Bean
    public ThreadPoolTaskExecutor clientOutboundChannelTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("websocket-outbound-");
        executor.setKeepAliveSeconds(60);
        executor.initialize();
        return executor;
    }
} 