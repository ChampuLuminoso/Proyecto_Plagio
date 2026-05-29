package co.edu.uan.fraudguard.ruleengine.strategy;

import co.edu.uan.fraudguard.ruleengine.dto.EvaluationRequest;
import co.edu.uan.fraudguard.ruleengine.model.Regla;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

/**
 * Detecta patrones inusuales combinando monto + horario + tipo de usuario.
 * En prototipo: monto alto + horario nocturno = patrón sospechoso.
 */
@Slf4j
@Component("PATRON")
public class PatronStrategy implements RuleStrategy {

    private static final BigDecimal MONTO_ALTO   = new BigDecimal("3000000");
    private static final int        HORA_NOCTURNA = 22;

    @Override
    public boolean applies(EvaluationRequest request, Regla regla) {
        try {
            boolean montoAlto = request.getMonto() != null
                && request.getMonto().compareTo(MONTO_ALTO) > 0;

            boolean horaNocturna = request.getProcesadaEn() != null
                && request.getProcesadaEn().getHour() >= HORA_NOCTURNA;

            boolean patron = montoAlto && horaNocturna;
            if (patron) {
                log.info("Regla PATRON '{}' activada: monto ${} a las {}h",
                    regla.getNombre(), request.getMonto(), request.getProcesadaEn().getHour());
            }
            return patron;

        } catch (Exception e) {
            log.error("Error evaluando regla PATRON {}: {}", regla.getId(), e.getMessage());
            return false;
        }
    }
}
