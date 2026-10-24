package com.freelance.project_service.controller;

import com.freelance.project_service.entity.Project;
import com.freelance.project_service.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/internal/projects")
@RequiredArgsConstructor
@PreAuthorize("hasRole('INTERNAL')")
public class InternalProjectController {
    private final ProjectService service;

    @GetMapping("/{id}/members")
    public Map<String, Object> members(@PathVariable Long id) {
        Project p = service.get(id);
        Map<String, Object> m = new HashMap<>();
        m.put("clientId", p.getClientId());
        m.put("freelancerId", p.getFreelancerId());
        return m;
    }
}