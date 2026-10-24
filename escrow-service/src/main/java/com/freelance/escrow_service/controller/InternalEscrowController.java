package com.freelance.escrow_service.controller;

import com.freelance.escrow_service.dto.HoldRequest;
import com.freelance.escrow_service.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/internal/escrow")
@RequiredArgsConstructor
@PreAuthorize("hasRole('INTERNAL')")
public class InternalEscrowController {
    private final WalletService service;

    @PostMapping("/hold")
    public Map<String, Object> hold(@Valid @RequestBody HoldRequest r) {
        return service.hold(r);
    }

    @PostMapping("/release/{milestoneId}")
    public Map<String, Object> release(@PathVariable Long milestoneId) {
        return service.release(milestoneId);
    }

    @PostMapping("/refund/{milestoneId}")
    public Map<String, Object> refund(@PathVariable Long milestoneId) {
        return service.refund(milestoneId);
    }

    @PostMapping("/split/{milestoneId}")
    public Map<String, Object> split(@PathVariable Long milestoneId,
                                     @RequestParam int freelancerPercent) {
        return service.split(milestoneId, freelancerPercent);
    }
}