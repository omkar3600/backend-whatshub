package com.whatshub.chatbot.executor;

import com.whatshub.chatbot.model.Node;
import com.whatshub.chatbot.model.UserSession;
import lombok.Value;

public interface NodeExecutor {
    NodeResult execute(String userId, Node node, UserSession session);
}

@Value
class NodeResult {
    String nextNodeId;
    boolean waitingForInput;

    public static NodeResult continueTo(String nextNodeId) {
        return new NodeResult(nextNodeId, false);
    }

    public static NodeResult waitForInput() {
        return new NodeResult(null, true);
    }
}
