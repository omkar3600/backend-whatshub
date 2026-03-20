package com.whatshub.chatbot.service;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class VariableResolver {
    private static final Pattern PATTERN = Pattern.compile("\\{\\{(.*?)\\}\\}");

    public static String resolve(String template, Map<String, Object> variables) {
        if (template == null) return null;
        
        StringBuilder sb = new StringBuilder();
        Matcher matcher = PATTERN.matcher(template);
        while (matcher.find()) {
            String key = matcher.group(1).trim();
            Object value = variables.getOrDefault(key, "");
            matcher.appendReplacement(sb, String.valueOf(value));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }
}
