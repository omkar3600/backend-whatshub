package com.whatshub.chatbot.service;

import com.whatshub.chatbot.executor.NodeExecutor;
import com.whatshub.chatbot.model.*;
import com.whatshub.chatbot.repository.FlowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FlowEngine {
    private final Map<String, NodeExecutor> executors;
    private final SessionService sessionService;
    private final FlowRepository flowRepository;

    public void proceed(String userId, String input) {
        UserSession session = sessionService.getOrCreateSession(userId);
        Flow flow = flowRepository.findById(session.getFlowId()).orElseThrow();
        FlowDefinition def = flow.getDefinition();

        String nextNodeId;
        if (session.getCurrentNodeId() == null) {
            nextNodeId = def.getStartNodeId();
        } else {
            nextNodeId = resolveTransition(def.getNodes().get(session.getCurrentNodeId()), input);
        }

        executeFrom(userId, def, nextNodeId, session);
    }

    private void executeFrom(String userId, FlowDefinition def, String nodeId, UserSession session) {
        String current = nodeId;
        while (current != null) {
            Node node = def.getNodes().get(current);
            NodeExecutor executor = executors.get(node.getType().name() + "NodeExecutor");
            
            var result = executor.execute(userId, node, session);
            
            session.setCurrentNodeId(current);
            sessionService.save(session);
            
            if (result.isWaitingForInput()) break;
            current = result.getNextNodeId();
        }
    }

    private String resolveTransition(Node node, String input) {
        if (node.getNext() != null && node.getNext().containsKey(input)) {
            return node.getNext().get(input);
        }
        return node.getDefaultNext();
    }
}
