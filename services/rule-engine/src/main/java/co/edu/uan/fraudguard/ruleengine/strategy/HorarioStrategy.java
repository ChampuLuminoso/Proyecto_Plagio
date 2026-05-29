package co.edu.uan.fraudguard.ruleengine.strategy;

import co.edu.uan.fraudguard.ruleengine.dto.EvaluationRequest;
import co.edu.uan.fraudguard.ruleengine.model.Regla;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Detecta transacciones realizadas fuera del horario permitido.
 * Parámetros esperados: { "hora_inicio": 23, "hora_fin": 5 }
 */
@Slf4j
@Component("HORARIO")
public class HorarioStrategy implements RuleStrategy {

    @Override
    public boolean applies(EvaluationRequest request, Regla regla) {
        try {
            if (request.getProcesadaEn() == null) return false;

            int hora       = request.getProcesadaEn().getHour();
            int horaInicio = regla.getParametros().get("hora_inicio").asInt();
            int horaFin    = regla.getParametros().get("hora_fin").asInt();

            boolean fueraHorario;
            // Rango que cruza medianoche (ej: 23 → 5)
            if (horaInicio > horaFin) {
                fueraHorario = hora >= horaInicio || hora < horaFin;
            } else {
                fueraHorario = hora >= horaInicio && hora < horaFin;
            }

            if (fueraHorario) {
                log.info("Regla HORARIO '{}' activada: transacción a las {}h", regla.getNombre(), hora);
            }
            return fueraHorario;

        } catch (Exception e) {
            log.error("Error evaluando regla HORARIO {}: {}", regla.getId(), e.getMessage());
            return false;
        }
    }
}
