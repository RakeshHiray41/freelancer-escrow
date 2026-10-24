package com.freelance.chat_service.security;

import com.freelance.chat_service.service.ProjectClient;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;
import java.security.Principal;

@Component
@RequiredArgsConstructor
public class StompAuthInterceptor implements ChannelInterceptor {
    private final JwtService jwt;
    private final ProjectClient projects;

    record StompUser(String id) implements Principal {
        @Override
        public String getName() {
            return id;
        }
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (acc == null || acc.getCommand() == null) return message;

        if (StompCommand.CONNECT.equals(acc.getCommand())) {
            String header = acc.getFirstNativeHeader("Authorization");
            if (header == null || !header.startsWith("Bearer "))
                throw new IllegalArgumentException("Unauthorized: token missing");
            try {
                Claims c = jwt.parse(header.substring(7));
                Long userId = ((Number) c.get("userId")).longValue();
                acc.setUser(new StompUser(String.valueOf(userId)));
            } catch (Exception e) {
                throw new IllegalArgumentException("Unauthorized: invalid or expired token");
            }
        }

        if (StompCommand.SUBSCRIBE.equals(acc.getCommand())) {
            Principal user = acc.getUser();
            String dest = acc.getDestination();
            if (user == null || dest == null)
                throw new IllegalArgumentException("Unauthorized");
            if (dest.startsWith("/topic/projects/")) {
                Long projectId = Long.parseLong(dest.substring("/topic/projects/".length()));
                projects.assertMember(projectId, Long.parseLong(user.getName()));
            } else if (!dest.startsWith("/user/")) {
                throw new IllegalArgumentException("Subscription not allowed");
            }
        }
        return message;
    }
}