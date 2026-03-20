package com.whatshub.chatbot.service;

import org.springframework.stereotype.Service;

@Service
public class WhatsAppService {
    public void sendMessage(String to, String content) {
        // Implementation for Meta Cloud API or BSP API
        System.out.println("DEBUG: Sending WhatsApp message to " + to + " Content: " + content);
    }
    
    public void sendButtons(String to, String text, java.util.List<String> buttons) {
        System.out.println("DEBUG: Sending Buttons to " + to + " Text: " + text + " Buttons: " + buttons);
    }
}
