package com.whatshub.chatbot.executor;

import com.whatshub.chatbot.model.Node;
import com.whatshub.chatbot.model.UserSession;
import org.springframework.stereotype.Component;

@Component
public class MessageNodeExecutor implements NodeExecutor {
    @Override
    public NodeResult execute(String userId, Node node, UserSession session) {
        // Here you would call WhatsAppService to send the message
        System.out.println("Sending message to " + userId + ": " + node.getContent());
        
        // If it's just a message, we immediately move to the next node if it exists
        return NodeResult.continueTo(node.getDefaultNext());
    }
}
