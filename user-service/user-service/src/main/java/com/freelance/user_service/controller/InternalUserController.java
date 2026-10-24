package com.freelance.user_service.controller;

import com.freelance.user_service.entity.User;
import com.freelance.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('INTERNAL')")
public class InternalUserController {
    private final UserRepository repo;

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable Long id) {
        User u = repo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail());
    }
}