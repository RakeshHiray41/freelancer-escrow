package com.freelance.user_service.service;

import com.freelance.user_service.dto.ProfileRequest;
import com.freelance.user_service.entity.Profile;
import com.freelance.user_service.entity.User;
import com.freelance.user_service.repository.ProfileRepository;
import com.freelance.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final UserRepository userRepo;
    private final ProfileRepository profileRepo;
    private final StorageService storage;

    @Value("${supabase.bucket.photos}")
    private String photoBucket;

    private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png");
    private static final long MAX_SIZE = 2 * 1024 * 1024;

    public Map<String, Object> getProfile(Long userId) {
        User u = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Profile p = profileRepo.findById(userId).orElse(new Profile());

        Map<String, Object> m = new HashMap<>();
        m.put("userId", userId);
        m.put("name", u.getName());
        m.put("email", u.getEmail());
        m.put("role", u.getRole().name());
        m.put("bio", p.getBio());
        m.put("skills", p.getSkills());
        m.put("hourlyRate", p.getHourlyRate());
        m.put("country", p.getCountry());
        m.put("photoUrl", p.getPhotoUrl());
        return m;
    }

    public Map<String, Object> updateProfile(Long userId, ProfileRequest r) {
        Profile p = profileRepo.findById(userId).orElseGet(() -> {
            Profile n = new Profile();
            n.setUserId(userId);
            return n;
        });
        p.setBio(r.getBio());
        p.setSkills(r.getSkills());
        p.setHourlyRate(r.getHourlyRate());
        p.setCountry(r.getCountry());
        profileRepo.save(p);
        return getProfile(userId);
    }

    public Map<String, Object> uploadPhoto(Long userId, MultipartFile file) throws IOException {
        if (file.isEmpty())
            throw new RuntimeException("File is empty");
        if (!ALLOWED.contains(file.getContentType()))
            throw new RuntimeException("Only JPG or PNG allowed");
        if (file.getSize() > MAX_SIZE)
            throw new RuntimeException("Max size is 2MB");

        String ext = "image/png".equals(file.getContentType()) ? "png" : "jpg";
        String path = "user-" + userId + "." + ext;
        String publicUrl = storage.uploadPublic(photoBucket, path, file.getBytes(), file.getContentType());

        Profile p = profileRepo.findById(userId).orElseGet(() -> {
            Profile n = new Profile();
            n.setUserId(userId);
            return n;
        });
        p.setPhotoUrl(publicUrl + "?v=" + System.currentTimeMillis());
        profileRepo.save(p);

        return Map.of("message", "Photo uploaded", "photoUrl", p.getPhotoUrl());
    }
}