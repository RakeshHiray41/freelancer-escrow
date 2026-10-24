package com.freelance.chat_service.service;

import com.freelance.chat_service.entity.ChatMessage;
import com.freelance.chat_service.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageRepository repo;
    private final ProjectClient projects;
    private final ModerationService moderation;
    private final SimpMessagingTemplate template;

    public ChatMessage send(Long projectId, Long senderId, String content) {
        if (content == null || content.isBlank())
            throw new RuntimeException("Message is empty");
        if (content.length() > 2000)
            throw new RuntimeException("Message too long (max 2000)");
        projects.assertMember(projectId, senderId);

        String warning = moderation.check(content);
        ChatMessage saved = repo.save(ChatMessage.builder()
                .projectId(projectId)
                .senderId(senderId)
                .content(content)
                .flagged(warning != null)
                .warning(warning)
                .createdAt(LocalDateTime.now())
                .build());

        template.convertAndSend("/topic/projects/" + projectId, saved);
        return saved;
    }

    public List<ChatMessage> history(Long projectId, Long userId) {
        projects.assertMember(projectId, userId);
        return repo.findByProjectIdOrderByCreatedAtAsc(projectId);
    }
}