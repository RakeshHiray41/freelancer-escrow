package com.freelance.project_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import java.math.BigDecimal;
import java.util.Map;

@Component
public class EscrowClient {
    private final RestClient client = RestClient.create();

    @Value("${escrow.url}")
    private String url;

    @Value("${internal.api-key}")
    private String key;

    public void hold(Long milestoneId, Long clientId, Long freelancerId, BigDecimal amount) {
        call("/internal/escrow/hold", Map.of(
                "milestoneId", milestoneId, "clientId", clientId,
                "freelancerId", freelancerId, "amount", amount));
    }

    public void release(Long milestoneId) {
        call("/internal/escrow/release/" + milestoneId, null);
    }

    public void refund(Long milestoneId) {
        call("/internal/escrow/refund/" + milestoneId, null);
    }

    public void split(Long milestoneId, int freelancerPercent) {
        call("/internal/escrow/split/" + milestoneId + "?freelancerPercent=" + freelancerPercent, null);
    }

    private void call(String path, Object body) {
        try {
            var req = client.post().uri(url + path).header("X-Internal-Key", key);
            if (body != null) req.body(body);
            req.retrieve().toBodilessEntity();
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            throw new RuntimeException("Escrow error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new RuntimeException("Escrow service not reachable");
        }
    }
}