package com.freelance.project_service.service;

import com.freelance.project_service.dto.ReviewRequest;
import com.freelance.project_service.entity.MilestoneStatus;
import com.freelance.project_service.entity.Project;
import com.freelance.project_service.entity.Review;
import com.freelance.project_service.repository.MilestoneRepository;
import com.freelance.project_service.repository.ProjectRepository;
import com.freelance.project_service.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviews;
    private final ProjectRepository projects;
    private final MilestoneRepository milestones;
    private final NotifyClient notify;

    public Review create(Long projectId, Long clientId, ReviewRequest r) {
        Project p = projects.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!p.getClientId().equals(clientId))
            throw new RuntimeException("Only the project client can review");
        if (p.getFreelancerId() == null)
            throw new RuntimeException("No freelancer was hired on this project");
        if (!milestones.existsByProjectIdAndStatus(projectId, MilestoneStatus.RELEASED))
            throw new RuntimeException("You can review after at least one milestone is paid");
        if (reviews.existsByProjectId(projectId))
            throw new RuntimeException("You already reviewed this project");

        Review saved = reviews.save(Review.builder()
                .projectId(projectId)
                .clientId(clientId)
                .freelancerId(p.getFreelancerId())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(LocalDateTime.now())
                .build());
        notify.send(p.getFreelancerId(), "REVIEW_RECEIVED", "New review",
                "You received a " + r.getRating() + "-star review on '" + p.getTitle() + "'.");
        return saved;
    }

    public Map<String, Object> forFreelancer(Long freelancerId) {
        List<Review> list = reviews.findByFreelancerIdOrderByIdDesc(freelancerId);
        double avg = list.stream().mapToInt(Review::getRating).average().orElse(0);
        avg = Math.round(avg * 100.0) / 100.0;
        return Map.of("freelancerId", freelancerId,
                "averageRating", avg,
                "count", list.size(),
                "reviews", list);
    }
}