package com.freelance.project_service.controller;

import com.freelance.project_service.dto.BidRequest;
import com.freelance.project_service.dto.ProjectRequest;
import com.freelance.project_service.entity.Bid;
import com.freelance.project_service.entity.Project;
import com.freelance.project_service.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService service;

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public Project create(Authentication auth, @Valid @RequestBody ProjectRequest r) {
        return service.create((Long) auth.getPrincipal(), r);
    }

    @GetMapping
    public List<Project> browse(@RequestParam(required = false) String skill,
                                @RequestParam(required = false) BigDecimal minBudget,
                                @RequestParam(required = false) BigDecimal maxBudget) {
        return service.browse(skill, minBudget, maxBudget);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('CLIENT')")
    public List<Project> mine(Authentication auth) {
        return service.myProjects((Long) auth.getPrincipal());
    }

    /** Projects where the logged-in freelancer was hired ("My work"). */
    @GetMapping("/assigned")
    @PreAuthorize("hasRole('FREELANCER')")
    public List<Project> assigned(Authentication auth) {
        return service.assignedTo((Long) auth.getPrincipal());
    }

    @GetMapping("/{id}")
    public Project get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping("/{id}/bids")
    @PreAuthorize("hasRole('FREELANCER')")
    public Bid bid(Authentication auth, @PathVariable Long id, @Valid @RequestBody BidRequest r) {
        return service.placeBid(id, (Long) auth.getPrincipal(), r);
    }

    @GetMapping("/{id}/bids")
    @PreAuthorize("hasRole('CLIENT')")
    public List<Bid> bids(Authentication auth, @PathVariable Long id) {
        return service.bidsFor(id, (Long) auth.getPrincipal());
    }

    @PostMapping("/{id}/hire/{bidId}")
    @PreAuthorize("hasRole('CLIENT')")
    public Project hire(Authentication auth, @PathVariable Long id, @PathVariable Long bidId) {
        return service.hire(id, bidId, (Long) auth.getPrincipal());
    }
}