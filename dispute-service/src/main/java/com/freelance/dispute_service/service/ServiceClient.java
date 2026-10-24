package com.freelance.dispute_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClient;

@Component
public class ServiceClient {
    private final RestClient client = RestClient.create();

    @Value("${project.url}") private String projectUrl;
    @Value("${internal.api-key}") private String key;

    /** Marks milestone DISPUTED and checks the user belongs to it. */
    public void markDisputed(Long milestoneId, Long userId) {
        post(projectUrl + "/internal/milestones/" + milestoneId + "/dispute?userId=" + userId);
    }

    /** Admin decision: RELEASE / REFUND / SPLIT. */
    public void applyDecision(Long milestoneId, String decision, Integer freelancerPercent) {
        String uri = projectUrl + "/internal/milestones/" + milestoneId + "/resolve?decision=" + decision;
        if (freelancerPercent != null) uri += "&freelancerPercent=" + freelancerPercent;
        post(uri);
    }

    private void post(String uri) {
        try {
            client.post().uri(uri).header("X-Internal-Key", key)
                    .retrieve().toBodilessEntity();
        } catch (HttpStatusCodeException e) {
            throw new RuntimeException("Service error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new RuntimeException("Other service not reachable");
        }
    }
}