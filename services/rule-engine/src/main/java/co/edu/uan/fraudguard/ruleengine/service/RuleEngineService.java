package co.edu.uan.fraudguard.ruleengine.service;

import co.edu.uan.fraudguard.ruleengine.dto.EvaluationRequest;
import co.edu.uan.fraudguard.ruleengine.dto.EvaluationResult;
import co.edu.uan.fraudguard.ruleengine.model.Regla;
import co.edu.uan.fraudguard.ruleengine.repository.ReglaRepository;
import co.edu.uan.fraudguard.ruleengine.strategy.RuleStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Servicio central del Rule Engine.
 * Aplica el patrón Strategy: cada tipo de regla tiene
 * su propia implementación de RuleStrategy.
 * Las reglas se cargan desde MySQL y son modificables
 * sin necesidad de redeploy.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RuleEngineService {

    private final ReglaRepository reglaRepo;

    // Mapa de estrategias inyectado por Spring (Strategy Pattern)
    private final Map<String, RuleStrategy> strategies;

    public EvaluationResult evaluate(EvaluationRequest request) {
        List<Regla> reglas = reglaRepo.findByActivaTrue();
        List<EvaluationResult.Violation> violations = new ArrayList<>();

        for (Regla regla : reglas) {
            RuleStrategy strategy = strategies.get(regla.getTipo().name());
            if (strategy == null) {
                log.warn("No hay estrategia para tipo de regla: {}", regla.getTipo());
                continue;
            }
            if (strategy.applies(request, regla)) {
                violations.add(new EvaluationResult.Violation(
                    regla.getId(),
                    regla.getNombre(),
                    regla.getTipo().name(),
                    regla.getParametros().get("nivel_riesgo").asText("MEDIO")
                ));
                log.info("Regla '{}' activada para transacción {}", regla.getNombre(), request.getTransaccionId());
            }
        }

        return EvaluationResult.builder()
                .transaccionId(request.getTransaccionId())
                .esAномala(!violations.isEmpty())
                .violations(violations)
                .nivelRiesgoMax(calcularNivelMaximo(violations))
                .build();
    }

    public List<Regla> getActiveRules() {
        return reglaRepo.findByActivaTrue();
    }

    private String calcularNivelMaximo(List<EvaluationResult.Violation> v) {
        if (v.stream().anyMatch(x -> "ALTO".equals(x.getNivelRiesgo())))  return "ALTO";
        if (v.stream().anyMatch(x -> "MEDIO".equals(x.getNivelRiesgo()))) return "MEDIO";
        return "BAJO";
    }
}
