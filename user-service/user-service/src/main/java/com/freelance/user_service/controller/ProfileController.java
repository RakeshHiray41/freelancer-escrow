package com.freelance.user_service.controller;

import com.freelance.user_service.dto.ProfileRequest;
import com.freelance.user_service.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService service;

    @GetMapping("/me")
    public Map<String, Object> me(Authentication auth) {
        return service.getProfile((Long) auth.getPrincipal());
    }

    @PutMapping("/me")
    public Map<String, Object> update(Authentication auth, @RequestBody ProfileRequest r) {
        return service.updateProfile((Long) auth.getPrincipal(), r);
    }

    @PostMapping("/photo")
    public Map<String, Object> photo(Authentication auth,
                                     @RequestParam("file") MultipartFile file) throws IOException {
        return service.uploadPhoto((Long) auth.getPrincipal(), file);
    }
}