package com.freelance.user_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    /** Links in the mails open the React app, not the backend. */
    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Async
    public void sendVerificationMail(String to, String name, String token) {
        SimpleMailMessage m = new SimpleMailMessage();
        m.setFrom(from);
        m.setTo(to);
        m.setSubject("Verify your email");
        m.setText("Hi " + name + ",\n\nClick the link to verify your email:\n"
                + frontendUrl + "/verify?token=" + token
                + "\n\nThis link is valid for 24 hours.");
        mailSender.send(m);
    }

    @Async
    public void sendResetMail(String to, String name, String token) {
        SimpleMailMessage m = new SimpleMailMessage();
        m.setFrom(from);
        m.setTo(to);
        m.setSubject("Reset your password");
        m.setText("Hi " + name + ",\n\nClick the link to set a new password:\n"
                + frontendUrl + "/reset-password?token=" + token
                + "\n\nThis link is valid for 1 hour. If you did not ask for this, ignore this mail.");
        mailSender.send(m);
    }
}