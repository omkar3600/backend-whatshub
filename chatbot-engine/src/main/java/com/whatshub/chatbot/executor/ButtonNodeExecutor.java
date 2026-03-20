package com.whatshub.chatbot.executor;

import com.whatshub.chatbot.model.RFNode;
import com.whatshub.chatbot.model.UserSession;
import com.whatshub.chatbot.service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component("BUTTON_EXECUTOR")
@RequiredArgsConstructor
public class ButtonNodeExecutor implements NodeExecutor {
    private final WhatsAppService whatsappService;

    @Override
    public NodeResult execute(RFNode node, UserSession session) {
        whatsappService.sendButtons(session.getUserId(), node.getData().getContent());
        return NodeResult.waitInput();
    }
}
