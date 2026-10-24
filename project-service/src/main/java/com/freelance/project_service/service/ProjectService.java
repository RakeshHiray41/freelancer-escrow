package com.freelance.project_service.service;

import com.freelance.project_service.dto.BidRequest;
import com.freelance.project_service.dto.ProjectRequest;
import com.freelance.project_service.entity.*;
import com.freelance.project_service.repository.BidRepository;
import com.freelance.project_service.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projects;
    private final BidRepository bids;
    private final NotifyClient notify;

    public Project create(Long clientId, ProjectRequest r) {
        return projects.save(Project.builder()
                .title(r.getTitle())
                .description(r.getDescription())
                .skills(r.getSkills())
                .budget(r.getBudget())
                .clientId(clientId)
                .status(ProjectStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .build());
    }

    public List<Project> browse(String skill, BigDecimal minBudget, BigDecimal maxBudget) {
        return projects.findByStatusOrderByCreatedAtDesc(ProjectStatus.OPEN).stream()
                .filter(p -> skill == null || skill.isBlank()
                        || (p.getSkills() != null
                        && p.getSkills().toLowerCase().contains(skill.toLowerCase())))
                .filter(p -> minBudget == null || p.getBudget().compareTo(minBudget) >= 0)
                .filter(p -> maxBudget == null || p.getBudget().compareTo(maxBudget) <= 0)
                .toList();
    }

    public List<Project> myProjects(Long clientId) {
        return projects.findByClientIdOrderByCreatedAtDesc(clientId);
    }

    /** Projects where this freelancer was hired. */
    public List<Project> assignedTo(Long freelancerId) {
        return projects.findByFreelancerIdOrderByCreatedAtDesc(freelancerId);
    }

    public Project get(Long id) {
        return projects.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
    }

    public Bid placeBid(Long projectId, Long freelancerId, BidRequest r) {
        Project p = get(projectId);
        if (p.getStatus() != ProjectStatus.OPEN)
            throw new RuntimeException("Project is not open for bids");
        if (bids.existsByProjectIdAndFreelancerId(projectId, freelancerId))
            throw new RuntimeException("You already placed a bid");
        Bid saved = bids.save(Bid.builder()
                .projectId(projectId)
                .freelancerId(freelancerId)
                .amount(r.getAmount())
                .proposal(r.getProposal())
                .status(BidStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build());
        notify.send(p.getClientId(), "BID_PLACED", "New bid on your project",
                "A freelancer placed a bid of " + r.getAmount() + " on '" + p.getTitle() + "'.");
        return saved;
    }

    public List<Bid> bidsFor(Long projectId, Long clientId) {
        Project p = get(projectId);
        if (!p.getClientId().equals(clientId))
            throw new RuntimeException("Not your project");
        return bids.findByProjectId(projectId);
    }

    @Transactional
    public Project hire(Long projectId, Long bidId, Long clientId) {
        Project p = get(projectId);
        if (!p.getClientId().equals(clientId))
            throw new RuntimeException("Not your project");
        if (p.getStatus() != ProjectStatus.OPEN)
            throw new RuntimeException("Project is not open");
        Bid chosen = bids.findById(bidId).orElseThrow(() -> new RuntimeException("Bid not found"));
        if (!chosen.getProjectId().equals(projectId))
            throw new RuntimeException("Bid does not belong to this project");

        for (Bid b : bids.findByProjectId(projectId)) {
            b.setStatus(b.getId().equals(bidId) ? BidStatus.ACCEPTED : BidStatus.REJECTED);
            bids.save(b);
        }
        p.setFreelancerId(chosen.getFreelancerId());
        p.setStatus(ProjectStatus.IN_PROGRESS);
        Project saved = projects.save(p);
        notify.send(chosen.getFreelancerId(), "HIRED", "You are hired!",
                "You have been hired for project '" + p.getTitle() + "'.");
        return saved;
    }
}