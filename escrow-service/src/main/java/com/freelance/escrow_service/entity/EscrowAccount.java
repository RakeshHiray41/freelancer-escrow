package com.freelance.escrow_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "escrow_accounts", uniqueConstraints = @UniqueConstraint(columnNames = "milestoneId"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EscrowAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long milestoneId;
    private Long clientId;
    private Long freelancerId;

    @Column(precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private EscrowStatus status;

    private LocalDateTime createdAt;
}