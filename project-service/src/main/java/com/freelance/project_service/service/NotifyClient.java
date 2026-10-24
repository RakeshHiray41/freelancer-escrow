package com.freelance.project_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import java.util.HashMap;
import java.util.Map;

@Component
public class NotifyClient {
    private final RestClient client = RestClient.create();

    @Value("${user.url}") private String userUrl;
    @Value("${notification.url}") private String notifyUrl;
    @Value("${internal.api-key}") private String key;

    /** Sends in-app notification + mail. Never throws. */
    public void send(Long userId, String type, String subject, String message) {
        try {
            String email = null;
            try {
                Map<?, ?> u = client.get().uri(userUrl + "/internal/users/" + userId)
                        .header("X-Internal-Key", key)
                        .retrieve().body(Map.class);
                if (u != null) email = (String) u.get("email");
            } catch (Exception ignored) {
            }

            Map<String, Object> body = new HashMap<>();
            body.put("userId", userId);
            body.put("type", type);
            body.put("subject", subject);
            body.put("message", message);
            body.put("email", email);

            client.post().uri(notifyUrl + "/internal/notify")
                    .header("X-Internal-Key", key)
                    .body(body)
                    .retrieve().toBodilessEntity();
        } catch (Exception e) {
            System.out.println("Notify failed: " + e.getMessage());
        }
    }
}