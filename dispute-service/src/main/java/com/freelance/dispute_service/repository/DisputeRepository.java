package com.freelance.dispute_service.repository;

import com.freelance.dispute_service.entity.Dispute;
import com.freelance.dispute_service.entity.DisputeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    List<Dispute> findByStatusOrderByIdDesc(DisputeStatus status);
    List<Dispute> findByRaisedByOrderByIdDesc(Long userId);
    boolean existsByMilestoneIdAndStatus(Long milestoneId, DisputeStatus status);
}