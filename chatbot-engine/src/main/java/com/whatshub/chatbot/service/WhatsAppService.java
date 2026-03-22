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

    public void sendForm(String to, String formTitle, java.util.Map<String, Object> formConfig) {
        System.out.println("DEBUG: Sending WhatsApp Native Form to " + to + " Title: " + formTitle);
    }

    public void sendWebview(String to, String buttonText, String url) {
        System.out.println("DEBUG: Sending WhatsApp Webview Button to " + to + " Button: " + buttonText + " URL: " + url);
    }

    public void sendPaymentRequest(String to, String amount, String currency, String referenceId) {
        System.out.println("DEBUG: Sending WhatsApp Payment Request to " + to + " Amount: " + currency + " " + amount + " Ref: " + referenceId);
    }

    public void routeToAgent(String userId, String department, String message) {
        System.out.println("DEBUG: Routing user " + userId + " to Agent Department [" + department + "] | Reason: " + message);
    }
}
