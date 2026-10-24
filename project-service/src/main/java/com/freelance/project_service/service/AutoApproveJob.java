package com.freelance.project_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AutoApproveJob {
    private final MilestoneService service;

    @Value("${milestone.auto-approve-days:7}")
    private int days;

    // runs every hour
    @Scheduled(fixedDelay = 3600000)
    public void run() {
        int n = service.autoApproveOverdue(days);
        if (n > 0) System.out.println("Auto-approved milestones: " + n);
    }
}