package com.freelance.notification_service.controller;

import com.freelance.notification_service.dto.NotifyRequest;
import com.freelance.notification_service.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
@PreAuthorize("hasRole('INTERNAL')")
public class InternalNotifyController {
    private final NotificationService service;

    @PostMapping("/notify")
    public void notify(@Valid @RequestBody NotifyRequest r) {
        service.notify(r);
    }
}