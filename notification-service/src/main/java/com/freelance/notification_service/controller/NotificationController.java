package com.freelance.notification_service.controller;

import com.freelance.notification_service.entity.Notification;
import com.freelance.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService service;

    @GetMapping
    public List<Notification> list(Authentication auth) {
        return service.list((Long) auth.getPrincipal());
    }

    @GetMapping("/unread-count")
    public Map<String, Object> unread(Authentication auth) {
        return service.unread((Long) auth.getPrincipal());
    }

    @PutMapping("/{id}/read")
    public Notification read(Authentication auth, @PathVariable String id) {
        return service.markRead(id, (Long) auth.getPrincipal());
    }
}