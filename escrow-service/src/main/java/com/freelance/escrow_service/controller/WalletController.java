package com.freelance.escrow_service.controller;

import com.freelance.escrow_service.dto.DepositRequest;
import com.freelance.escrow_service.entity.LedgerEntry;
import com.freelance.escrow_service.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
public class WalletController {
    private final WalletService service;

    @GetMapping("/balance")
    public Map<String, Object> balance(Authentication auth) {
        return service.balance((Long) auth.getPrincipal());
    }

    @GetMapping("/transactions")
    public List<LedgerEntry> history(Authentication auth) {
        return service.history((Long) auth.getPrincipal());
    }

    /** Test top-up. Send header Idempotency-Key to avoid double credit. */
    @PostMapping("/deposit")
    public Map<String, Object> deposit(Authentication auth,
                                       @RequestHeader(value = "Idempotency-Key", required = false) String key,
                                       @Valid @RequestBody DepositRequest r) {
        return service.deposit((Long) auth.getPrincipal(), r.getAmount(), key);
    }
}