package com.whatshub.chatbot.model;

import lombok.Data;
import java.util.Map;

@Data
public class FlowDefinition {
    private String startNodeId;
    private Map<String, Node> nodes;
    private Map<String, Object> globalVariables;
}
