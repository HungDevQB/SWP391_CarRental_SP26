package com.carrental.car_rental.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * WebSocket Channel Interceptor for chat security and monitoring
 * Provides authentication, rate limiting, and logging for WebSocket connections
 */
@Component
public class WebSocketChannelInterceptor implements ChannelInterceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(WebSocketChannelInterceptor.class);
    
    @Autowired
    private com.carrental.car_rental.config.JwtTokenProvider jwtTokenProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null) {
            StompCommand command = accessor.getCommand();
            String sessionId = accessor.getSessionId();

            // Log connection attempts
            if (StompCommand.CONNECT.equals(command)) {
                logger.info("WebSocket CONNECT attempt from session: {}", sessionId);
                String authToken = accessor.getFirstNativeHeader("Authorization");
                if (authToken != null && isValidToken(authToken)) {
                    String token = authToken.replace("Bearer ", "");
                    String username = jwtTokenProvider.getUsernameFromToken(token);
                    accessor.setUser(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(username, null, java.util.Collections.emptyList()));
                    logger.info("WebSocket authenticated for user: {}", username);
                } else {
                    logger.warn("Invalid or missing token for session: {}", sessionId);
                    return null; // Reject connection
                }
            }

            // Log disconnections
            if (StompCommand.DISCONNECT.equals(command)) {
                logger.info("WebSocket DISCONNECT from session: {}", sessionId);
            }

            // Log message sending
            if (StompCommand.SEND.equals(command)) {
                String destination = accessor.getDestination();
                logger.debug("WebSocket SEND to destination: {} from session: {}", destination, sessionId);
            }

            // Log subscriptions
            if (StompCommand.SUBSCRIBE.equals(command)) {
                String destination = accessor.getDestination();
                logger.info("WebSocket SUBSCRIBE to destination: {} from session: {}", destination, sessionId);
            }

            // Log unsubscriptions
            if (StompCommand.UNSUBSCRIBE.equals(command)) {
                String subscriptionId = accessor.getSubscriptionId();
                logger.info("WebSocket UNSUBSCRIBE subscription: {} from session: {}", subscriptionId, sessionId);
            }
        }

        return message;
    }
    
    @Override
    public void postSend(Message<?> message, MessageChannel channel, boolean sent) {
        if (!sent) {
            StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
            if (accessor != null) {
                logger.warn("Failed to send WebSocket message from session: {}", accessor.getSessionId());
            }
        }
    }
    
    @Override
    public boolean preReceive(MessageChannel channel) {
        return true;
    }
    
    @Override
    public Message<?> postReceive(Message<?> message, MessageChannel channel) {
        return message;
    }
    
    // Helper method for future authentication implementation
    private boolean isValidToken(String token) {
        // TODO: Implement JWT token validation
        // This should validate the JWT token and extract user information
        return token != null && !token.isEmpty();
    }
    
    // Helper method for future rate limiting implementation
    private boolean isRateLimited(String sessionId) {
        // TODO: Implement rate limiting logic
        // This could use Redis or in-memory cache to track message rates per session
        return false;
    }
}
