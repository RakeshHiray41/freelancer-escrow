package com.freelance.user_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class StorageService {
    private final RestClient client = RestClient.create();

    @Value("${supabase.url}")
    private String url;

    @Value("${supabase.key}")
    private String key;

    /** Uploads bytes to Supabase Storage and returns the public URL. */
    public String uploadPublic(String bucket, String path, byte[] data, String contentType) {
        client.post()
                .uri(url + "/storage/v1/object/" + bucket + "/" + path)
                .headers(h -> {
                    h.set("apikey", key);
                    if (!key.startsWith("sb_")) h.setBearerAuth(key);
                    h.set("x-upsert", "true");
                })
                .contentType(MediaType.parseMediaType(contentType))
                .body(data)
                .retrieve()
                .toBodilessEntity();
        return url + "/storage/v1/object/public/" + bucket + "/" + path;
    }
}