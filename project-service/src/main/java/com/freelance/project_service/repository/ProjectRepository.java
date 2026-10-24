package com.freelance.project_service.repository;

import com.freelance.project_service.entity.Project;
import com.freelance.project_service.entity.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStatusOrderByCreatedAtDesc(ProjectStatus status);
    List<Project> findByClientIdOrderByCreatedAtDesc(Long clientId);
    List<Project> findByFreelancerIdOrderByCreatedAtDesc(Long freelancerId);
}