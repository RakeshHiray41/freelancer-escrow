package com.freelance.project_service.controller;

import com.freelance.project_service.service.MilestoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/milestones")
@RequiredArgsConstructor
@PreAuthorize("hasRole('INTERNAL')")
public class InternalMilestoneController {
    private final MilestoneService service;

    @PostMapping("/{id}/dispute")
    public void dispute(@PathVariable Long id, @RequestParam Long userId) {
        service.markDisputed(id, userId);
    }

    @PostMapping("/{id}/resolve")
    public void resolve(@PathVariable Long id,
                        @RequestParam String decision,
                        @RequestParam(required = false) Integer freelancerPercent) {
        service.resolveDispute(id, decision, freelancerPercent);
    }
}