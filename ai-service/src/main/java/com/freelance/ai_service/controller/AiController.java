package com.freelance.ai_service.controller;

import com.freelance.ai_service.dto.AiDtos.*;
import com.freelance.ai_service.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {
    private final AiService service;

    @PostMapping(value = "/milestones/generate", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('CLIENT')")
    public String milestones(@Valid @RequestBody MilestoneGenRequest r) {
        return service.generateMilestones(r);
    }

    @PostMapping(value = "/proposal", produces = MediaType.TEXT_PLAIN_VALUE)
    @PreAuthorize("hasRole('FREELANCER')")
    public String proposal(@Valid @RequestBody ProposalRequest r) {
        return service.writeProposal(r);
    }

    @PostMapping(value = "/dispute/summary", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public String dispute(@Valid @RequestBody DisputeRequest r) {
        return service.disputeSummary(r);
    }

    @PostMapping(value = "/deliverable/check", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('CLIENT','ADMIN')")
    public String deliverable(@Valid @RequestBody DeliverableRequest r) {
        return service.checkDeliverable(r);
    }
}