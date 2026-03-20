package com.whatshub.chatbot.executor;

import com.whatshub.chatbot.model.Node;
import com.whatshub.chatbot.model.UserSession;
import org.springframework.stereotype.Component;

@Component
public class ButtonNodeExecutor implements NodeExecutor {
    @Override
    public NodeResult execute(String userId, Node node, UserSession session) {
        // Send button message to WhatsApp
        System.out.println("Sending buttons to " + userId + ": " + node.getContent());
        
        // We must stop and wait for the user to click a button
        return NodeResult.waitForInput();
    }
}
