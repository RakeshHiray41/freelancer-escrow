package com.freelance.dispute_service.controller;

import com.freelance.dispute_service.dto.RaiseRequest;
import com.freelance.dispute_service.dto.ResolveRequest;
import com.freelance.dispute_service.entity.Dispute;
import com.freelance.dispute_service.service.DisputeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/disputes")
@RequiredArgsConstructor
public class DisputeController {
    private final DisputeService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT','FREELANCER')")
    public Dispute raise(Authentication auth, @Valid @RequestBody RaiseRequest r) {
        return service.raise((Long) auth.getPrincipal(), r);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('CLIENT','FREELANCER')")
    public List<Dispute> mine(Authentication auth) {
        return service.mine((Long) auth.getPrincipal());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Dispute> open() {
        return service.open();
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public Dispute resolve(Authentication auth, @PathVariable Long id,
                           @Valid @RequestBody ResolveRequest r) {
        return service.resolve(id, (Long) auth.getPrincipal(), r);
    }
}