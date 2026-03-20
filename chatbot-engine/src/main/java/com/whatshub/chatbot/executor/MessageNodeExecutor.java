package com.whatshub.chatbot.executor;

import com.whatshub.chatbot.model.RFNode;
import com.whatshub.chatbot.model.UserSession;
import com.whatshub.chatbot.service.WhatsAppService;
import com.whatshub.chatbot.service.VariableResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component("MESSAGE_EXECUTOR")
@RequiredArgsConstructor
public class MessageNodeExecutor implements NodeExecutor {
    private final WhatsAppService whatsappService;
    private final VariableResolver variableResolver;

    @Override
    public NodeResult execute(RFNode node, UserSession session) {
        String content = variableResolver.resolve(node.getData().getContent(), session.getVariables());
        whatsappService.sendMessage(session.getUserId(), content);
        return NodeResult.next(null); // FlowEngine will resolve next node from edges
    }
}
