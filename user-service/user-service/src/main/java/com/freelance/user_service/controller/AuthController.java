package com.freelance.user_service.controller;

import com.freelance.user_service.dto.ForgotPasswordRequest;
import com.freelance.user_service.dto.LoginRequest;
import com.freelance.user_service.dto.RefreshRequest;
import com.freelance.user_service.dto.RegisterRequest;
import com.freelance.user_service.dto.ResetPasswordRequest;
import com.freelance.user_service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService service;

    @PostMapping("/register")
    public Map<String, Object> register(@Valid @RequestBody RegisterRequest r) {
        return service.register(r);
    }

    @GetMapping("/verify")
    public Map<String, Object> verify(@RequestParam String token) {
        return service.verifyEmail(token);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest r) {
        return service.login(r);
    }

    @PostMapping("/refresh")
    public Map<String, Object> refresh(@RequestBody RefreshRequest r) {
        return service.refresh(r.getRefreshToken());
    }

    @PostMapping("/logout")
    public Map<String, Object> logout(@RequestBody RefreshRequest r) {
        return service.logout(r.getRefreshToken());
    }

    @PostMapping("/forgot-password")
    public Map<String, Object> forgot(@RequestBody ForgotPasswordRequest r) {
        return service.forgotPassword(r.getEmail());
    }

    @PostMapping("/reset-password")
    public Map<String, Object> reset(@Valid @RequestBody ResetPasswordRequest r) {
        return service.resetPassword(r);
    }
}