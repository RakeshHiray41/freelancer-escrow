package com.freelance.chat_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "chat_messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessage {
    @Id
    private String id;

    @Indexed
    private Long projectId;

    private Long senderId;
    private String content;
    private boolean flagged;
    private String warning;
    private LocalDateTime createdAt;
}