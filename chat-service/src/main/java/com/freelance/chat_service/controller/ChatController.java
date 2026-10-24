package com.freelance.chat_service.controller;

import com.freelance.chat_service.dto.SendRequest;
import com.freelance.chat_service.entity.ChatMessage;
import com.freelance.chat_service.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/chat/projects")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('CLIENT','FREELANCER')")
public class ChatController {
    private final ChatService service;

    @GetMapping("/{projectId}/messages")
    public List<ChatMessage> history(Authentication auth, @PathVariable Long projectId) {
        return service.history(projectId, (Long) auth.getPrincipal());
    }

    @PostMapping("/{projectId}/messages")
    public ChatMessage send(Authentication auth, @PathVariable Long projectId,
                            @Valid @RequestBody SendRequest r) {
        return service.send(projectId, (Long) auth.getPrincipal(), r.getContent());
    }
}