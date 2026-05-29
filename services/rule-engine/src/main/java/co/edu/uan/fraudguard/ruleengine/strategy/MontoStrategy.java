package co.edu.uan.fraudguard.ruleengine.strategy;

import co.edu.uan.fraudguard.ruleengine.dto.EvaluationRequest;
import co.edu.uan.fraudguard.ruleengine.model.Regla;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

/**
 * Detecta transacciones cuyo monto supera el máximo definido en la regla.
 * Parámetros esperados en JSON: { "monto_maximo": 6000000, "servicio": "MATRICULA" }
 */
@Slf4j
@Component("MONTO")
public class MontoStrategy implements RuleStrategy {

    @Override
    public boolean applies(EvaluationRequest request, Regla regla) {
        try {
            // Si la regla es para un servicio específico, verificar que coincida
            if (regla.getParametros().has("servicio")) {
                String servicioRegla = regla.getParametros().get("servicio").asText();
                if (!servicioRegla.equalsIgnoreCase(request.getServicio())) {
                    return false;
                }
            }

            BigDecimal montoMaximo = new BigDecimal(
                regla.getParametros().get("monto_maximo").asText()
            );

            boolean supera = request.getMonto().compareTo(montoMaximo) > 0;
            if (supera) {
                log.info("Regla MONTO '{}' activada: ${} > ${}", regla.getNombre(), request.getMonto(), montoMaximo);
            }
            return supera;

        } catch (Exception e) {
            log.error("Error evaluando regla MONTO {}: {}", regla.getId(), e.getMessage());
            return false;
        }
    }
}
