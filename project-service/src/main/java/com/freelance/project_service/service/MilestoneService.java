package com.freelance.project_service.service;

import com.freelance.project_service.dto.MilestoneRequest;
import com.freelance.project_service.dto.RevisionRequest;
import com.freelance.project_service.dto.SubmitRequest;
import com.freelance.project_service.entity.*;
import com.freelance.project_service.repository.MilestoneRepository;
import com.freelance.project_service.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.freelance.project_service.entity.MilestoneStatus.*;

@Service
@RequiredArgsConstructor
public class MilestoneService {
    private final MilestoneRepository milestones;
    private final ProjectRepository projects;
    private final EscrowClient escrow;
    private final NotifyClient notify;

    private static final Map<MilestoneStatus, Set<MilestoneStatus>> ALLOWED = Map.of(
            CREATED, Set.of(FUNDED),
            FUNDED, Set.of(IN_PROGRESS),
            IN_PROGRESS, Set.of(SUBMITTED),
            SUBMITTED, Set.of(APPROVED, REVISION_REQUESTED, DISPUTED),
            REVISION_REQUESTED, Set.of(SUBMITTED, DISPUTED),
            APPROVED, Set.of(RELEASED),
            RELEASED, Set.of(),
            DISPUTED, Set.of(RELEASED, REFUNDED),
            REFUNDED, Set.of()
    );

    private void move(Milestone m, MilestoneStatus next) {
        if (!ALLOWED.get(m.getStatus()).contains(next))
            throw new RuntimeException("Cannot move from " + m.getStatus() + " to " + next);
        m.setStatus(next);
    }

    private Project projectOf(Milestone m) {
        return projects.findById(m.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    private Milestone find(Long id) {
        return milestones.findById(id).orElseThrow(() -> new RuntimeException("Milestone not found"));
    }

    private void mustBeClient(Project p, Long userId) {
        if (!p.getClientId().equals(userId))
            throw new RuntimeException("Only the project client can do this");
    }

    private void mustBeFreelancer(Project p, Long userId) {
        if (p.getFreelancerId() == null || !p.getFreelancerId().equals(userId))
            throw new RuntimeException("Only the hired freelancer can do this");
    }

    public Milestone create(Long projectId, Long clientId, MilestoneRequest r) {
        Project p = projects.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        mustBeClient(p, clientId);
        return milestones.save(Milestone.builder()
                .projectId(projectId)
                .title(r.getTitle())
                .description(r.getDescription())
                .acceptanceCriteria(r.getAcceptanceCriteria())
                .amount(r.getAmount())
                .dueDate(r.getDueDate())
                .status(CREATED)
                .createdAt(LocalDateTime.now())
                .build());
    }

    public List<Milestone> list(Long projectId, Long userId) {
        Project p = projects.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        boolean allowed = p.getClientId().equals(userId)
                || (p.getFreelancerId() != null && p.getFreelancerId().equals(userId));
        if (!allowed) throw new RuntimeException("Not your project");
        return milestones.findByProjectIdOrderByIdAsc(projectId);
    }

    @Transactional
    public Milestone fund(Long id, Long clientId) {
        Milestone m = find(id);
        Project p = projectOf(m);
        mustBeClient(p, clientId);
        if (p.getFreelancerId() == null)
            throw new RuntimeException("Hire a freelancer first");
        if (m.getStatus() != CREATED)
            throw new RuntimeException("Cannot move from " + m.getStatus() + " to " + FUNDED);

        escrow.hold(m.getId(), p.getClientId(), p.getFreelancerId(), m.getAmount());
        move(m, FUNDED);
        Milestone saved = milestones.save(m);
        notify.send(p.getFreelancerId(), "MILESTONE_FUNDED", "Milestone funded",
                "Milestone '" + m.getTitle() + "' is funded. You can start work.");
        return saved;
    }

    @Transactional
    public Milestone start(Long id, Long freelancerId) {
        Milestone m = find(id);
        mustBeFreelancer(projectOf(m), freelancerId);
        move(m, IN_PROGRESS);
        return milestones.save(m);
    }

    @Transactional
    public Milestone submit(Long id, Long freelancerId, SubmitRequest r) {
        Milestone m = find(id);
        Project p = projectOf(m);
        mustBeFreelancer(p, freelancerId);
        move(m, SUBMITTED);
        m.setSubmissionNote(r.getNote());
        m.setSubmissionLink(r.getLink());
        m.setSubmittedAt(LocalDateTime.now());
        Milestone saved = milestones.save(m);
        notify.send(p.getClientId(), "WORK_SUBMITTED", "Work submitted",
                "Work submitted for milestone '" + m.getTitle() + "'. Please review.");
        return saved;
    }

    @Transactional
    public Milestone requestRevision(Long id, Long clientId, RevisionRequest r) {
        Milestone m = find(id);
        Project p = projectOf(m);
        mustBeClient(p, clientId);
        move(m, REVISION_REQUESTED);
        m.setRevisionNote(r.getNote());
        Milestone saved = milestones.save(m);
        notify.send(p.getFreelancerId(), "REVISION_REQUESTED", "Revision requested",
                "Client requested changes on '" + m.getTitle() + "': " + r.getNote());
        return saved;
    }

    @Transactional
    public Milestone approve(Long id, Long clientId) {
        Milestone m = find(id);
        mustBeClient(projectOf(m), clientId);
        return doApprove(m);
    }

    private Milestone doApprove(Milestone m) {
        move(m, APPROVED);
        escrow.release(m.getId());
        move(m, RELEASED);
        Milestone saved = milestones.save(m);
        Project p = projectOf(m);
        notify.send(p.getFreelancerId(), "PAYMENT_RELEASED", "Payment released",
                "Payment for milestone '" + m.getTitle() + "' has been released to your wallet.");
        return saved;
    }

    @Transactional
    public int autoApproveOverdue(int days) {
        List<Milestone> overdue = milestones.findByStatusAndSubmittedAtBefore(
                SUBMITTED, LocalDateTime.now().minusDays(days));
        overdue.forEach(this::doApprove);
        return overdue.size();
    }

    @Transactional
    public void markDisputed(Long id, Long userId) {
        Milestone m = find(id);
        Project p = projectOf(m);
        boolean member = p.getClientId().equals(userId)
                || (p.getFreelancerId() != null && p.getFreelancerId().equals(userId));
        if (!member) throw new RuntimeException("Not your milestone");
        move(m, DISPUTED);
        milestones.save(m);
        Long other = p.getClientId().equals(userId) ? p.getFreelancerId() : p.getClientId();
        notify.send(other, "DISPUTE_RAISED", "Dispute raised",
                "A dispute was raised on milestone '" + m.getTitle() + "'. Admin will review.");
    }

    @Transactional
    public void resolveDispute(Long id, String decision, Integer freelancerPercent) {
        Milestone m = find(id);
        Project p = projectOf(m);
        if (m.getStatus() != DISPUTED)
            throw new RuntimeException("Milestone is not disputed");
        String text;
        switch (decision) {
            case "RELEASE" -> {
                escrow.release(m.getId());
                move(m, RELEASED);
                text = "full payment to freelancer";
            }
            case "REFUND" -> {
                escrow.refund(m.getId());
                move(m, REFUNDED);
                text = "full refund to client";
            }
            case "SPLIT" -> {
                if (freelancerPercent == null)
                    throw new RuntimeException("freelancerPercent is required for SPLIT");
                escrow.split(m.getId(), freelancerPercent);
                move(m, RELEASED);
                text = "split: " + freelancerPercent + "% freelancer, "
                        + (100 - freelancerPercent) + "% client";
            }
            default -> throw new RuntimeException("Unsupported decision: " + decision);
        }
        milestones.save(m);
        String msg = "Dispute on milestone '" + m.getTitle() + "' resolved (" + text + ").";
        notify.send(p.getClientId(), "DISPUTE_RESOLVED", "Dispute resolved", msg);
        notify.send(p.getFreelancerId(), "DISPUTE_RESOLVED", "Dispute resolved", msg);
    }
}