package com.freelance.project_service.controller;

import com.freelance.project_service.dto.ReviewRequest;
import com.freelance.project_service.entity.Review;
import com.freelance.project_service.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService service;

    @PostMapping("/projects/{projectId}/review")
    @PreAuthorize("hasRole('CLIENT')")
    public Review create(Authentication auth, @PathVariable Long projectId,
                         @Valid @RequestBody ReviewRequest r) {
        return service.create(projectId, (Long) auth.getPrincipal(), r);
    }

    @GetMapping("/users/{freelancerId}/reviews")
    public Map<String, Object> forFreelancer(@PathVariable Long freelancerId) {
        return service.forFreelancer(freelancerId);
    }
}