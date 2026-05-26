package co.edu.uan.fraudguard.ruleengine.controller;

import co.edu.uan.fraudguard.ruleengine.dto.EvaluationRequest;
import co.edu.uan.fraudguard.ruleengine.dto.EvaluationResult;
import co.edu.uan.fraudguard.ruleengine.service.RuleEngineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rules")
@RequiredArgsConstructor
public class RuleEngineController {

    private final RuleEngineService service;

    /**
     * Evalúa una transacción contra todas las reglas activas.
     * Llamado de forma SÍNCRONA por el Fraud Analysis Service.
     */
    @PostMapping("/evaluate")
    public ResponseEntity<EvaluationResult> evaluate(@RequestBody EvaluationRequest request) {
        EvaluationResult result = service.evaluate(request);
        return ResponseEntity.ok(result);
    }

    /** Lista todas las reglas activas */
    @GetMapping
    public ResponseEntity<?> listRules() {
        return ResponseEntity.ok(service.getActiveRules());
    }
}
