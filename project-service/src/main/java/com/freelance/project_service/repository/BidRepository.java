package com.freelance.project_service.repository;

import com.freelance.project_service.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByProjectId(Long projectId);
    boolean existsByProjectIdAndFreelancerId(Long projectId, Long freelancerId);
}