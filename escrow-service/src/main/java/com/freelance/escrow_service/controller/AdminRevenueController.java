package com.freelance.escrow_service.controller;

import com.freelance.escrow_service.entity.Wallet;
import com.freelance.escrow_service.repository.LedgerRepository;
import com.freelance.escrow_service.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/admin/revenue")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRevenueController {
    private final LedgerRepository ledger;
    private final WalletRepository wallets;

    @GetMapping
    public Map<String, Object> revenue() {
        BigDecimal platformBalance = wallets.findById(0L)
                .map(Wallet::getAvailable).orElse(BigDecimal.ZERO);
        return Map.of("totalFees", ledger.totalFees(),
                "platformBalance", platformBalance);
    }
}