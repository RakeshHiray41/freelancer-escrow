package com.freelance.chat_service.repository;

import com.freelance.chat_service.entity.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findByProjectIdOrderByCreatedAtAsc(Long projectId);
}