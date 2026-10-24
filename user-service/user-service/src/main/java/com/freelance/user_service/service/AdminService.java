package com.freelance.user_service.service;

import com.freelance.user_service.entity.Role;
import com.freelance.user_service.entity.User;
import com.freelance.user_service.repository.RefreshTokenRepository;
import com.freelance.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository users;
    private final RefreshTokenRepository refreshTokens;

    public List<Map<String, Object>> listUsers() {
        return users.findAll().stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole().name());
            m.put("emailVerified", u.isEmailVerified());
            m.put("blocked", u.isBlocked());
            return m;
        }).toList();
    }

    @Transactional
    public Map<String, Object> setBlocked(Long id, boolean blocked) {
        User u = users.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (u.getRole() == Role.ADMIN)
            throw new RuntimeException("Admin user cannot be blocked");
        u.setBlocked(blocked);
        users.save(u);
        if (blocked) refreshTokens.deleteByUser(u);   // no new access tokens after block
        return Map.of("id", u.getId(), "blocked", u.isBlocked());
    }
}