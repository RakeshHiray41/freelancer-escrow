package com.freelance.project_service.repository;

import com.freelance.project_service.entity.Milestone;
import com.freelance.project_service.entity.MilestoneStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findByProjectIdOrderByIdAsc(Long projectId);
    List<Milestone> findByStatusAndSubmittedAtBefore(MilestoneStatus status, LocalDateTime time);
    boolean existsByProjectIdAndStatus(Long projectId, MilestoneStatus status);
}