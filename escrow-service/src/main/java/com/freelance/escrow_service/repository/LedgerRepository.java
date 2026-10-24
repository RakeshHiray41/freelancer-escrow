package com.freelance.escrow_service.repository;

import com.freelance.escrow_service.entity.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;

public interface LedgerRepository extends JpaRepository<LedgerEntry, Long> {
    List<LedgerEntry> findByWalletUserIdOrderByIdDesc(Long userId);
    boolean existsByIdempotencyKey(String key);

    @Query("select coalesce(sum(l.amount), 0) from LedgerEntry l "
            + "where l.type = com.freelance.escrow_service.entity.EntryType.FEE")
    BigDecimal totalFees();
}