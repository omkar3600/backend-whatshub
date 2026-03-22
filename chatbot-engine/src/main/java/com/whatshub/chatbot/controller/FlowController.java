package com.whatshub.chatbot.controller;

import com.whatshub.chatbot.model.Flow;
import com.whatshub.chatbot.model.FlowDefinition;
import com.whatshub.chatbot.repository.FlowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flows")
@RequiredArgsConstructor
public class FlowController {
    private final FlowRepository flowRepository;

    @GetMapping
    public List<Flow> getAll() {
        return flowRepository.findAll();
    }

    @PostMapping("/{id}/save")
    public Flow save(@PathVariable UUID id, @RequestBody FlowDefinition definition) {
        return flowRepository.findById(id)
            .map(flow -> {
                flow.setDefinition(definition);
                return flowRepository.save(flow);
            })
            .orElseGet(() -> {
                Flow newFlow = new Flow();
                newFlow.setId(id);
                newFlow.setDefinition(definition);
                newFlow.setActive(true);
                return flowRepository.save(newFlow);
            });
    }

    @PostMapping
    public Flow create(@RequestBody Flow flow) {
        return flowRepository.save(flow);
    }
}
