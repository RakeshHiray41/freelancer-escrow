package com.freelance.ai_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClient;
import java.util.List;
import java.util.Map;

@Component
public class GeminiClient {
    private final RestClient client = RestClient.create();

    @Value("${gemini.api-key}") private String apiKey;
    @Value("${gemini.model}") private String model;
    @Value("${gemini.url}") private String baseUrl;

    /** Returns the model's answer as JSON text. */
    public String askJson(String system, String userText) {
        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", system))),
                "contents", List.of(Map.of("role", "user",
                        "parts", List.of(Map.of("text", userText)))),
                "generationConfig", Map.of("responseMimeType", "application/json",
                        "temperature", 0.4)
        );
        return call(body);
    }

    /** Returns the model's answer as plain text. */
    public String askText(String system, String userText) {
        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", system))),
                "contents", List.of(Map.of("role", "user",
                        "parts", List.of(Map.of("text", userText)))),
                "generationConfig", Map.of("temperature", 0.6)
        );
        return call(body);
    }

    @SuppressWarnings("unchecked")
    private String call(Map<String, Object> body) {
        try {
            Map<String, Object> res = client.post()
                    .uri(baseUrl + "/" + model + ":generateContent")
                    .header("x-goog-api-key", apiKey)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) res.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (HttpStatusCodeException e) {
            throw new RuntimeException("AI error " + e.getStatusCode().value() + ": " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new RuntimeException("AI service failed: " + e.getMessage());
        }
    }
}