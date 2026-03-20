package com.whatshub.chatbot.service;

import com.whatshub.chatbot.model.UserSession;
import com.whatshub.chatbot.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {
    private final SessionRepository sessionRepository;

    public UserSession getOrCreateSession(String userId) {
        return sessionRepository.findById(userId)
                .orElseGet(() -> {
                    UserSession session = new UserSession();
                    session.setUserId(userId);
                    session.setLastInteractionAt(System.currentTimeMillis());
                    return session;
                });
    }

    public void save(UserSession session) {
        session.setLastInteractionAt(System.currentTimeMillis());
        sessionRepository.save(session);
    }
}
