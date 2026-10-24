package com.freelance.chat_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClient;
import java.util.Map;

@Component
public class ProjectClient {
    private final RestClient client = RestClient.create();

    @Value("${project.url}") private String projectUrl;
    @Value("${internal.api-key}") private String key;

    /** Throws if the user is not the client or the hired freelancer of this project. */
    public void assertMember(Long projectId, Long userId) {
        Map<?, ?> m;
        try {
            m = client.get().uri(projectUrl + "/internal/projects/" + projectId + "/members")
                    .header("X-Internal-Key", key)
                    .retrieve().body(Map.class);
        } catch (HttpStatusCodeException e) {
            throw new RuntimeException("Project not found");
        } catch (Exception e) {
            throw new RuntimeException("Project service not reachable");
        }
        if (m == null) throw new RuntimeException("Project not found");

        Object c = m.get("clientId");
        Object f = m.get("freelancerId");
        if (f == null)
            throw new RuntimeException("Chat starts after a freelancer is hired");
        boolean member = userId.equals(((Number) c).longValue())
                || userId.equals(((Number) f).longValue());
        if (!member)
            throw new RuntimeException("You are not part of this project");
    }
}