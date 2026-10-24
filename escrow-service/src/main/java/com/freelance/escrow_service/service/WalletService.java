package com.freelance.escrow_service.service;

import com.freelance.escrow_service.dto.HoldRequest;
import com.freelance.escrow_service.entity.*;
import com.freelance.escrow_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepository wallets;
    private final LedgerRepository ledger;
    private final EscrowRepository escrows;

    @Value("${escrow.platform-fee-percent:5}")
    private BigDecimal feePercent;

    /** Platform's own wallet gets the fee. userId 0 = platform. */
    private static final Long PLATFORM = 0L;

    private Wallet wallet(Long userId) {
        return wallets.findById(userId).orElseGet(() -> {
            Wallet w = new Wallet();
            w.setUserId(userId);
            return wallets.save(w);
        });
    }

    private void log(Long userId, EntryType type, BigDecimal amount, Long milestoneId, String key) {
        ledger.save(LedgerEntry.builder()
                .walletUserId(userId).type(type).amount(amount)
                .milestoneId(milestoneId).idempotencyKey(key)
                .createdAt(LocalDateTime.now()).build());
    }

    public Map<String, Object> balance(Long userId) {
        Wallet w = wallet(userId);
        return Map.of("userId", userId, "available", w.getAvailable(), "held", w.getHeld());
    }

    public List<LedgerEntry> history(Long userId) {
        return ledger.findByWalletUserIdOrderByIdDesc(userId);
    }

    /** Test top-up. Replace with Razorpay later. */
    @Transactional
    public Map<String, Object> deposit(Long userId, BigDecimal amount, String idemKey) {
        if (idemKey != null && ledger.existsByIdempotencyKey("dep-" + userId + "-" + idemKey))
            return balance(userId);
        Wallet w = wallet(userId);
        w.setAvailable(w.getAvailable().add(amount));
        wallets.save(w);
        log(userId, EntryType.DEPOSIT, amount, null,
                idemKey == null ? null : "dep-" + userId + "-" + idemKey);
        return balance(userId);
    }

    /** Client's money: available -> held (milestone funded). */
    @Transactional
    public Map<String, Object> hold(HoldRequest r) {
        if (escrows.findByMilestoneId(r.getMilestoneId()).isPresent())
            return Map.of("message", "Already held", "milestoneId", r.getMilestoneId());

        Wallet w = wallet(r.getClientId());
        if (w.getAvailable().compareTo(r.getAmount()) < 0)
            throw new RuntimeException("Insufficient balance. Please deposit first.");

        w.setAvailable(w.getAvailable().subtract(r.getAmount()));
        w.setHeld(w.getHeld().add(r.getAmount()));
        wallets.save(w);

        escrows.save(EscrowAccount.builder()
                .milestoneId(r.getMilestoneId())
                .clientId(r.getClientId())
                .freelancerId(r.getFreelancerId())
                .amount(r.getAmount())
                .status(EscrowStatus.HELD)
                .createdAt(LocalDateTime.now()).build());
        log(r.getClientId(), EntryType.HOLD, r.getAmount(), r.getMilestoneId(), null);
        return Map.of("message", "Held", "milestoneId", r.getMilestoneId());
    }

    /** Approved: client held -> freelancer available (minus platform fee). */
    @Transactional
    public Map<String, Object> release(Long milestoneId) {
        EscrowAccount e = escrows.findByMilestoneId(milestoneId)
                .orElseThrow(() -> new RuntimeException("No escrow for this milestone"));
        if (e.getStatus() == EscrowStatus.RELEASED)
            return Map.of("message", "Already released");
        if (e.getStatus() != EscrowStatus.HELD)
            throw new RuntimeException("Escrow is " + e.getStatus());

        BigDecimal fee = e.getAmount().multiply(feePercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal payout = e.getAmount().subtract(fee);

        Wallet client = wallet(e.getClientId());
        client.setHeld(client.getHeld().subtract(e.getAmount()));
        wallets.save(client);

        Wallet freelancer = wallet(e.getFreelancerId());
        freelancer.setAvailable(freelancer.getAvailable().add(payout));
        wallets.save(freelancer);

        Wallet platform = wallet(PLATFORM);
        platform.setAvailable(platform.getAvailable().add(fee));
        wallets.save(platform);

        e.setStatus(EscrowStatus.RELEASED);
        escrows.save(e);

        log(e.getClientId(), EntryType.RELEASE_OUT, e.getAmount(), milestoneId, null);
        log(e.getFreelancerId(), EntryType.RELEASE_IN, payout, milestoneId, null);
        log(PLATFORM, EntryType.FEE, fee, milestoneId, null);
        return Map.of("message", "Released", "payout", payout, "fee", fee);
    }

    /** Dispute lost by freelancer: client gets money back. */
    @Transactional
    public Map<String, Object> refund(Long milestoneId) {
        EscrowAccount e = escrows.findByMilestoneId(milestoneId)
                .orElseThrow(() -> new RuntimeException("No escrow for this milestone"));
        if (e.getStatus() == EscrowStatus.REFUNDED)
            return Map.of("message", "Already refunded");
        if (e.getStatus() != EscrowStatus.HELD)
            throw new RuntimeException("Escrow is " + e.getStatus());

        Wallet client = wallet(e.getClientId());
        client.setHeld(client.getHeld().subtract(e.getAmount()));
        client.setAvailable(client.getAvailable().add(e.getAmount()));
        wallets.save(client);

        e.setStatus(EscrowStatus.REFUNDED);
        escrows.save(e);
        log(e.getClientId(), EntryType.REFUND, e.getAmount(), milestoneId, null);
        return Map.of("message", "Refunded");
    }

    /**
     * Dispute SPLIT: freelancerPercent% goes to freelancer (platform fee cut from that part),
     * the rest goes back to the client.
     */
    @Transactional
    public Map<String, Object> split(Long milestoneId, int freelancerPercent) {
        if (freelancerPercent < 1 || freelancerPercent > 99)
            throw new RuntimeException("freelancerPercent must be between 1 and 99");

        EscrowAccount e = escrows.findByMilestoneId(milestoneId)
                .orElseThrow(() -> new RuntimeException("No escrow for this milestone"));
        if (e.getStatus() != EscrowStatus.HELD)
            return Map.of("message", "Already settled", "status", e.getStatus().name());

        BigDecimal total = e.getAmount();
        BigDecimal freelancerGross = total.multiply(BigDecimal.valueOf(freelancerPercent))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal clientBack = total.subtract(freelancerGross);
        BigDecimal fee = freelancerGross.multiply(feePercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal payout = freelancerGross.subtract(fee);

        Wallet client = wallet(e.getClientId());
        client.setHeld(client.getHeld().subtract(total));
        client.setAvailable(client.getAvailable().add(clientBack));
        wallets.save(client);

        Wallet freelancer = wallet(e.getFreelancerId());
        freelancer.setAvailable(freelancer.getAvailable().add(payout));
        wallets.save(freelancer);

        Wallet platform = wallet(PLATFORM);
        platform.setAvailable(platform.getAvailable().add(fee));
        wallets.save(platform);

        // settled; status RELEASED (no new enum value, avoids DB check constraint)
        e.setStatus(EscrowStatus.RELEASED);
        escrows.save(e);

        log(e.getClientId(), EntryType.RELEASE_OUT, freelancerGross, milestoneId, null);
        log(e.getClientId(), EntryType.REFUND, clientBack, milestoneId, null);
        log(e.getFreelancerId(), EntryType.RELEASE_IN, payout, milestoneId, null);
        log(PLATFORM, EntryType.FEE, fee, milestoneId, null);
        return Map.of("message", "Split done", "freelancerPayout", payout,
                "clientRefund", clientBack, "fee", fee);
    }
}