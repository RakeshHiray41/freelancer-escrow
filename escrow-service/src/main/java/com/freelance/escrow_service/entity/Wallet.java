package com.freelance.escrow_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "wallets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Wallet {
    @Id
    private Long userId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal available = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal held = BigDecimal.ZERO;

    @Version
    private Long version;
}