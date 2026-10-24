package com.freelance.project_service.controller;

import com.freelance.project_service.dto.MilestoneRequest;
import com.freelance.project_service.dto.RevisionRequest;
import com.freelance.project_service.dto.SubmitRequest;
import com.freelance.project_service.entity.Milestone;
import com.freelance.project_service.service.MilestoneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class MilestoneController {
    private final MilestoneService service;

    @PostMapping("/projects/{projectId}/milestones")
    @PreAuthorize("hasRole('CLIENT')")
    public Milestone create(Authentication auth, @PathVariable Long projectId,
                            @Valid @RequestBody MilestoneRequest r) {
        return service.create(projectId, (Long) auth.getPrincipal(), r);
    }

    @GetMapping("/projects/{projectId}/milestones")
    public List<Milestone> list(Authentication auth, @PathVariable Long projectId) {
        return service.list(projectId, (Long) auth.getPrincipal());
    }

    @PostMapping("/milestones/{id}/fund")
    @PreAuthorize("hasRole('CLIENT')")
    public Milestone fund(Authentication auth, @PathVariable Long id) {
        return service.fund(id, (Long) auth.getPrincipal());
    }

    @PostMapping("/milestones/{id}/start")
    @PreAuthorize("hasRole('FREELANCER')")
    public Milestone start(Authentication auth, @PathVariable Long id) {
        return service.start(id, (Long) auth.getPrincipal());
    }

    @PostMapping("/milestones/{id}/submit")
    @PreAuthorize("hasRole('FREELANCER')")
    public Milestone submit(Authentication auth, @PathVariable Long id,
                            @Valid @RequestBody SubmitRequest r) {
        return service.submit(id, (Long) auth.getPrincipal(), r);
    }

    @PostMapping("/milestones/{id}/request-revision")
    @PreAuthorize("hasRole('CLIENT')")
    public Milestone revision(Authentication auth, @PathVariable Long id,
                              @Valid @RequestBody RevisionRequest r) {
        return service.requestRevision(id, (Long) auth.getPrincipal(), r);
    }

    @PostMapping("/milestones/{id}/approve")
    @PreAuthorize("hasRole('CLIENT')")
    public Milestone approve(Authentication auth, @PathVariable Long id) {
        return service.approve(id, (Long) auth.getPrincipal());
    }
}