package com.freelance.dispute_service.service;

import com.freelance.dispute_service.dto.RaiseRequest;
import com.freelance.dispute_service.dto.ResolveRequest;
import com.freelance.dispute_service.entity.*;
import com.freelance.dispute_service.repository.DisputeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DisputeService {
    private final DisputeRepository repo;
    private final ServiceClient other;

    public Dispute raise(Long userId, RaiseRequest r) {
        if (repo.existsByMilestoneIdAndStatus(r.getMilestoneId(), DisputeStatus.OPEN))
            throw new RuntimeException("A dispute is already open for this milestone");
        other.markDisputed(r.getMilestoneId(), userId);
        return repo.save(Dispute.builder()
                .milestoneId(r.getMilestoneId())
                .raisedBy(userId)
                .reason(r.getReason())
                .status(DisputeStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .build());
    }

    public List<Dispute> open() {
        return repo.findByStatusOrderByIdDesc(DisputeStatus.OPEN);
    }

    public List<Dispute> mine(Long userId) {
        return repo.findByRaisedByOrderByIdDesc(userId);
    }

    public Dispute resolve(Long id, Long adminId, ResolveRequest r) {
        Dispute d = repo.findById(id).orElseThrow(() -> new RuntimeException("Dispute not found"));
        if (d.getStatus() != DisputeStatus.OPEN)
            throw new RuntimeException("Already resolved");

        Integer percent = r.getFreelancerPercent();
        if (r.getDecision() == Decision.SPLIT) {
            if (percent == null || percent < 1 || percent > 99)
                throw new RuntimeException("For SPLIT, freelancerPercent must be between 1 and 99");
        } else {
            percent = null;
        }

        other.applyDecision(d.getMilestoneId(), r.getDecision().name(), percent);
        d.setStatus(DisputeStatus.RESOLVED);
        d.setDecision(r.getDecision());
        d.setFreelancerPercent(percent);
        d.setAdminNote(r.getAdminNote());
        d.setResolvedBy(adminId);
        d.setResolvedAt(LocalDateTime.now());
        return repo.save(d);
    }
}