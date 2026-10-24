package com.freelance.project_service.controller;

import com.freelance.project_service.entity.Milestone;
import com.freelance.project_service.entity.Project;
import com.freelance.project_service.repository.MilestoneRepository;
import com.freelance.project_service.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class MilestoneLookupController {
    private final MilestoneRepository milestones;
    private final ProjectRepository projects;

    /** Milestone details for its client, its freelancer, or an admin. */
    @GetMapping("/milestones/{id}/details")
    public Map<String, Object> details(@PathVariable Long id, Authentication auth) {
        Milestone m = milestones.findById(id).orElseThrow(() -> new RuntimeException("Milestone not found"));
        Project p = projects.findById(m.getProjectId()).orElseThrow(() -> new RuntimeException("Project not found"));
        Long uid = (Long) auth.getPrincipal();
        boolean admin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean member = p.getClientId().equals(uid) || (p.getFreelancerId() != null && p.getFreelancerId().equals(uid));
        if (!admin && !member) throw new RuntimeException("Not your milestone");

        Map<String, Object> r = new HashMap<>();
        r.put("id", m.getId());
        r.put("title", m.getTitle());
        r.put("description", m.getDescription());
        r.put("acceptanceCriteria", m.getAcceptanceCriteria());
        r.put("amount", m.getAmount());
        r.put("status", m.getStatus());
        r.put("submissionNote", m.getSubmissionNote());
        r.put("submissionLink", m.getSubmissionLink());
        r.put("revisionNote", m.getRevisionNote());
        r.put("projectId", p.getId());
        r.put("projectTitle", p.getTitle());
        r.put("clientId", p.getClientId());
        r.put("freelancerId", p.getFreelancerId());
        return r;
    }
}