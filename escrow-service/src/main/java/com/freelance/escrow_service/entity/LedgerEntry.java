package com.freelance.escrow_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ledger_entries")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LedgerEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long walletUserId;

    @Enumerated(EnumType.STRING)
    private EntryType type;

    @Column(precision = 19, scale = 2)
    private BigDecimal amount;

    private Long milestoneId;
    private String idempotencyKey;
    private LocalDateTime createdAt;
}