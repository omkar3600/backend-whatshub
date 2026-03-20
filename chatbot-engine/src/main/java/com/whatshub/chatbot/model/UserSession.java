package com.whatshub.chatbot.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

@Data
@RedisHash(value = "UserSession", timeToLive = 3600) // 1 hour session
public class UserSession implements Serializable {
    @Id
    private String userId; // Usually phone number
    private String flowId;
    private String currentNodeId;
    private Map<String, Object> variables = new HashMap<>();
    private long lastInteractionAt;
    private boolean completed = false;
}
