package com.freelance.user_service.controller;

import com.freelance.user_service.entity.Profile;
import com.freelance.user_service.entity.User;
import com.freelance.user_service.repository.ProfileRepository;
import com.freelance.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class PublicUserController {
    private final UserRepository users;
    private final ProfileRepository profiles;

    /** Public card: name, role, photo. The email is added only when the caller is an admin. */
    @GetMapping("/{id}/public")
    public Map<String, Object> get(@PathVariable Long id, Authentication auth) {
        User u = users.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId());
        m.put("name", u.getName());
        m.put("role", u.getRole().name());
        m.put("photoUrl", profiles.findById(id).map(Profile::getPhotoUrl).orElse(null));

        boolean admin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (admin) m.put("email", u.getEmail());
        return m;
    }
}