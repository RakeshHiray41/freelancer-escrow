package com.freelance.project_service.repository;

import com.freelance.project_service.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByFreelancerIdOrderByIdDesc(Long freelancerId);
    boolean existsByProjectId(Long projectId);
}