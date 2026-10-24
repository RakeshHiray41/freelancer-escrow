package com.freelance.escrow_service.repository;

import com.freelance.escrow_service.entity.EscrowAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EscrowRepository extends JpaRepository<EscrowAccount, Long> {
    Optional<EscrowAccount> findByMilestoneId(Long milestoneId);
}