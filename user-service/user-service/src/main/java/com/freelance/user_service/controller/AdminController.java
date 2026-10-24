package com.freelance.user_service.controller;

import com.freelance.user_service.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService service;

    @GetMapping
    public List<Map<String, Object>> list() {
        return service.listUsers();
    }

    @PutMapping("/{id}/block")
    public Map<String, Object> block(@PathVariable Long id,
                                     @RequestParam(defaultValue = "true") boolean blocked) {
        return service.setBlocked(id, blocked);
    }
}