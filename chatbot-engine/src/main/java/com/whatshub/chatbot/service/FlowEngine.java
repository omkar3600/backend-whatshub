package com.whatshub.chatbot.service;

import com.whatshub.chatbot.executor.NodeExecutor;
import com.whatshub.chatbot.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlowEngine {
    private final Map<String, NodeExecutor> executors;
    private final SessionService sessionService;

    public void execute(String userId, String input, Flow flow) {
        UserSession session = sessionService.getOrCreateSession(userId, flow.getId());
        FlowDefinition definition = flow.getDefinition();
        
        String currentNodeId = session.getCurrentNode();
        if (currentNodeId == null) {
            // Find start node (usually the one with NO incoming edges or specifically marked)
            currentNodeId = definition.getNodes().stream()
                .filter(n -> "START".equals(n.getData().getType()))
                .findFirst()
                .map(RFNode::getId)
                .orElse(definition.getNodes().get(0).getId());
        }

        processNode(currentNodeId, session, definition);
    }

    private void processNode(String nodeId, UserSession session, FlowDefinition definition) {
        RFNode node = findNode(nodeId, definition);
        if (node == null) return;

        session.setCurrentNode(nodeId);
        sessionService.saveSession(session);

        // Map frontend types to executor beans
        String executorType = node.getData().getType() + "_EXECUTOR";
        NodeExecutor executor = executors.get(executorType);
        
        if (executor != null) {
            NodeExecutor.NodeResult result = executor.execute(node, session);
            
            if (!result.isWaitForInput()) {
                String nextId = result.getNextNodeId();
                if (nextId == null) {
                    nextId = findNextNodeId(nodeId, definition, null);
                }
                
                if (nextId != null) {
                    processNode(nextId, session, definition);
                }
            }
        }
    }

    private RFNode findNode(String id, FlowDefinition def) {
        return def.getNodes().stream().filter(n -> n.getId().equals(id)).findFirst().orElse(null);
    }

    private String findNextNodeId(String sourceId, FlowDefinition def, String handle) {
        return def.getEdges().stream()
            .filter(e -> e.getSource().equals(sourceId))
            .filter(e -> handle == null || handle.equals(e.getSourceHandle()))
            .findFirst()
            .map(RFEdge::getTarget)
            .orElse(null);
    }
}
