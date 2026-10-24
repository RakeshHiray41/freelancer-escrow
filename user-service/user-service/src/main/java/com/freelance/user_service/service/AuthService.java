package com.freelance.user_service.service;

import com.freelance.user_service.dto.LoginRequest;
import com.freelance.user_service.dto.RegisterRequest;
import com.freelance.user_service.dto.ResetPasswordRequest;
import com.freelance.user_service.entity.PasswordResetToken;
import com.freelance.user_service.entity.RefreshToken;
import com.freelance.user_service.entity.User;
import com.freelance.user_service.entity.VerificationToken;
import com.freelance.user_service.repository.PasswordResetTokenRepository;
import com.freelance.user_service.repository.RefreshTokenRepository;
import com.freelance.user_service.repository.UserRepository;
import com.freelance.user_service.repository.VerificationTokenRepository;
import com.freelance.user_service.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository repo;
    private final VerificationTokenRepository tokenRepo;
    private final PasswordResetTokenRepository resetRepo;
    private final RefreshTokenRepository refreshRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final MailService mail;

    public Map<String, Object> register(RegisterRequest r) {
        if (repo.existsByEmail(r.getEmail()))
            throw new RuntimeException("Email already registered");
        User u = User.builder()
                .name(r.getName())
                .email(r.getEmail())
                .password(encoder.encode(r.getPassword()))
                .role(r.getRole())
                .emailVerified(false)
                .build();
        repo.save(u);

        String token = UUID.randomUUID().toString();
        tokenRepo.save(VerificationToken.builder()
                .token(token)
                .user(u)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build());
        mail.sendVerificationMail(u.getEmail(), u.getName(), token);

        return Map.of("message", "Registered. Please check your email to verify.", "userId", u.getId());
    }

    public Map<String, Object> verifyEmail(String token) {
        VerificationToken vt = tokenRepo.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));
        if (vt.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Token expired");
        User u = vt.getUser();
        u.setEmailVerified(true);
        repo.save(u);
        tokenRepo.delete(vt);
        return Map.of("message", "Email verified successfully. You can login now.");
    }

    public Map<String, Object> login(LoginRequest r) {
        User u = repo.findByEmail(r.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        if (!encoder.matches(r.getPassword(), u.getPassword()))
            throw new RuntimeException("Invalid email or password");
        if (!u.isEmailVerified())
            throw new RuntimeException("Please verify your email first");
        if (u.isBlocked())
            throw new RuntimeException("Your account is blocked. Contact support.");

        String refresh = UUID.randomUUID().toString();
        refreshRepo.save(RefreshToken.builder()
                .token(refresh)
                .user(u)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build());

        return Map.of(
                "accessToken", jwt.generateToken(u),
                "refreshToken", refresh,
                "role", u.getRole().name());
    }

    public Map<String, Object> refresh(String refreshToken) {
        RefreshToken rt = refreshRepo.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
        if (rt.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshRepo.delete(rt);
            throw new RuntimeException("Refresh token expired, please login again");
        }
        if (rt.getUser().isBlocked())
            throw new RuntimeException("Your account is blocked. Contact support.");
        return Map.of("accessToken", jwt.generateToken(rt.getUser()));
    }

    public Map<String, Object> logout(String refreshToken) {
        refreshRepo.findByToken(refreshToken).ifPresent(refreshRepo::delete);
        return Map.of("message", "Logged out");
    }

    public Map<String, Object> forgotPassword(String email) {
        repo.findByEmail(email).ifPresent(u -> {
            String token = UUID.randomUUID().toString();
            resetRepo.save(PasswordResetToken.builder()
                    .token(token)
                    .user(u)
                    .expiresAt(LocalDateTime.now().plusHours(1))
                    .build());
            mail.sendResetMail(u.getEmail(), u.getName(), token);
        });
        return Map.of("message", "If this email is registered, a reset mail has been sent.");
    }

    public Map<String, Object> resetPassword(ResetPasswordRequest r) {
        PasswordResetToken t = resetRepo.findByToken(r.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid token"));
        if (t.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Token expired");
        User u = t.getUser();
        u.setPassword(encoder.encode(r.getNewPassword()));
        repo.save(u);
        resetRepo.delete(t);
        return Map.of("message", "Password changed successfully. You can login now.");
    }
}