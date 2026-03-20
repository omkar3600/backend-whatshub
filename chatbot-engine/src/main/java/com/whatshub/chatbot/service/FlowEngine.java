package com.whatshub.chatbot.service;

import com.whatshub.chatbot.executor.NodeExecutor;
import com.whatshub.chatbot.model.*;
import com.whatshub.chatbot.repository.FlowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlowEngine {
    private final Map<String, NodeExecutor> executors;
    private final SessionService sessionService;
    private final FlowRepository flowRepository;

    public void proceed(String userId, String input) {
        // For demonstration, we pick the first active flow or a "default" one
        flowRepository.findAll().stream()
            .filter(Flow::isActive)
            .findFirst()
            .ifPresent(flow -> engage(userId, input, flow));
    }

    public void engage(String userId, String input, Flow flow) {
        UserSession session = sessionService.getOrCreateSession(userId, flow.getId());
        FlowDefinition definition = flow.getDefinition();
        
        String currentNodeId = session.getCurrentNode();
        if (currentNodeId == null) {
            // Find start node in React Flow graph
            currentNodeId = definition.getNodes().stream()
                .filter(n -> "START".equals(n.getData().getType()))
                .findFirst()
                .map(RFNode::getId)
                .orElse(definition.getNodes().get(0).getId());
        } else {
            // If we're waiting for input, the input belongs to the CURRENT node
            // and we need to resolve the transition to the NEXT node.
            currentNodeId = findNextNodeId(currentNodeId, definition, input);
        }

        if (currentNodeId != null) {
            processNode(currentNodeId, session, definition);
        }
    }

    private void processNode(String nodeId, UserSession session, FlowDefinition definition) {
        RFNode node = findNode(nodeId, definition);
        if (node == null) return;

        session.setCurrentNode(nodeId);
        sessionService.saveSession(session);

        String type = node.getData().getType();
        String executorType = type + "_EXECUTOR";
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
            } else {
                log.info("System waiting for user input at node: {}", nodeId);
            }
        } else {
            log.error("No executor found for type: {}", executorType);
        }
    }

    private RFNode findNode(String id, FlowDefinition def) {
        return def.getNodes().stream().filter(n -> n.getId().equals(id)).findFirst().orElse(null);
    }

    private String findNextNodeId(String sourceId, FlowDefinition def, String input) {
        // In AiSensy, for BUTTON nodes, we match input to the label. 
        // For linear nodes, we just take the first edge.
        return def.getEdges().stream()
            .filter(e -> e.getSource().equals(sourceId))
            .filter(e -> input == null || matchEdge(e, input, def))
            .findFirst()
            .map(RFEdge::getTarget)
            .orElse(null);
    }

    private boolean matchEdge(RFEdge edge, String input, FlowDefinition def) {
        // If it's a specific handle connection (like a "yes" button)
        if (edge.getSourceHandle() != null) {
            return input.equalsIgnoreCase(edge.getSourceHandle());
        }
        return true; 
    }
}
