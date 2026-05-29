package co.edu.uan.fraudguard.ruleengine.strategy;

import co.edu.uan.fraudguard.ruleengine.dto.EvaluationRequest;
import co.edu.uan.fraudguard.ruleengine.model.Regla;

/**
 * Interfaz base del patrón Strategy.
 * Cada tipo de regla tiene su propia implementación.
 */
public interface RuleStrategy {
    boolean applies(EvaluationRequest request, Regla regla);
}
