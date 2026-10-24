package com.freelance.notification_service.service;

import com.freelance.notification_service.dto.NotifyRequest;
import com.freelance.notification_service.entity.Notification;
import com.freelance.notification_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository repo;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    public void notify(NotifyRequest r) {
        repo.save(Notification.builder()
                .userId(r.getUserId())
                .type(r.getType())
                .message(r.getMessage())
                .read(false)
                .createdAt(LocalDateTime.now())
                .build());
        if (r.getEmail() != null && !r.getEmail().isBlank())
            sendMail(r.getEmail(), r.getSubject() == null ? r.getType() : r.getSubject(), r.getMessage());
    }

    @Async
    public void sendMail(String to, String subject, String text) {
        try {
            SimpleMailMessage m = new SimpleMailMessage();
            m.setFrom(from);
            m.setTo(to);
            m.setSubject(subject);
            m.setText(text);
            mailSender.send(m);
        } catch (Exception e) {
            System.out.println("Mail failed: " + e.getMessage());
        }
    }

    public List<Notification> list(Long userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Map<String, Object> unread(Long userId) {
        return Map.of("unread", repo.countByUserIdAndReadFalse(userId));
    }

    public Notification markRead(String id, Long userId) {
        Notification n = repo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        if (!n.getUserId().equals(userId)) throw new RuntimeException("Not your notification");
        n.setRead(true);
        return repo.save(n);
    }
}