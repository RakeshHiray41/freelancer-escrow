package com.freelance.api_gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutes {

    @Bean
    public RouteLocator routes(RouteLocatorBuilder b,
                               @Value("${user.url}") String user,
                               @Value("${project.url}") String project,
                               @Value("${escrow.url}") String escrow,
                               @Value("${dispute.url}") String dispute,
                               @Value("${notification.url}") String notification,
                               @Value("${ai.url}") String ai,
                               @Value("${chat.url}") String chat,
                               @Value("${chat.ws.url}") String chatWs) {
        return b.routes()
                .route("user", r -> r.path("/auth/**", "/profile/**", "/admin/users/**").uri(user))
                .route("project", r -> r.path("/projects/{id}/review", "/projects/**", "/milestones/**", "/users/**").uri(project))
                .route("escrow", r -> r.path("/wallet/**", "/admin/revenue/**").uri(escrow))
                .route("dispute", r -> r.path("/disputes/**").uri(dispute))
                .route("notification", r -> r.path("/notifications/**").uri(notification))
                .route("ai", r -> r.path("/ai/**").uri(ai))
                .route("chat", r -> r.path("/chat/**").uri(chat))
                .route("chat-ws", r -> r.path("/ws-chat/**").uri(chatWs))
                .build();
    }
}