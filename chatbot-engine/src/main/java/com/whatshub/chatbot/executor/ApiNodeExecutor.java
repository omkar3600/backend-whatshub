package com.whatshub.chatbot.executor;

import com.whatshub.chatbot.model.Node;
import com.whatshub.chatbot.model.UserSession;
import com.whatshub.chatbot.service.VariableResolver;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Component
public class ApiNodeExecutor implements NodeExecutor {
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public NodeResult execute(String userId, Node node, UserSession session) {
        // Interpolate URL variables
        String resolvedUrl = VariableResolver.resolve(node.getUrl(), session.getVariables());
        
        try {
            // Execute API Call
            Map<String, Object> response = restTemplate.getForObject(resolvedUrl, Map.class);
            
            // Map response fields to session variables
            if (node.getResponseMapping() != null && response != null) {
                node.getResponseMapping().forEach((path, varName) -> {
                    // Simplified: In production use JsonPath for complex mappings
                    Object value = response.get(path.replace("$.", ""));
                    session.getVariables().put(varName, value);
                });
            }
            
            return NodeResult.continueTo(node.getDefaultNext());
        } catch (Exception e) {
            System.err.println("API Call failed for node " + node.getId() + ": " + e.getMessage());
            return NodeResult.continueTo(node.getDefaultNext()); // Or a fallback node
        }
    }
}
