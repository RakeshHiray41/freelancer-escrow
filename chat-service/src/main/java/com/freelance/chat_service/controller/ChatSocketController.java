package com.freelance.chat_service.controller;

import com.freelance.chat_service.dto.SendRequest;
import com.freelance.chat_service.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatSocketController {
    private final ChatService service;

    /** Client sends to /app/projects/{projectId}/send  with body {"content":"hello"} */
    @MessageMapping("/projects/{projectId}/send")
    public void send(@DestinationVariable Long projectId,
                     @Payload SendRequest r,
                     Principal principal) {
        service.send(projectId, Long.parseLong(principal.getName()), r.getContent());
    }

    /** Errors come back only to the sender at /user/queue/errors */
    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public String onError(Exception e) {
        return e.getMessage();
    }
}