package com.freelance.escrow_service.repository;

import com.freelance.escrow_service.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
}