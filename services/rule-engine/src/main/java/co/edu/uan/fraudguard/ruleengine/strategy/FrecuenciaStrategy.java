package co.edu.uan.fraudguard.ruleengine.strategy;

import co.edu.uan.fraudguard.ruleengine.dto.EvaluationRequest;
import co.edu.uan.fraudguard.ruleengine.model.Regla;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Detecta frecuencia anormal de transacciones del mismo usuario.
 * Parámetros: { "max_transacciones": 5, "ventana_minutos": 10 }
 * Nota: en prototipo se marca como potencialmente anómala si el usuario
 * es un sistema automatizado (sys.*), ya que no tenemos historial en tiempo real.
 */
@Slf4j
@Component("FRECUENCIA")
public class FrecuenciaStrategy implements RuleStrategy {

    @Override
    public boolean applies(EvaluationRequest request, Regla regla) {
        try {
            // En prototipo: detectar usuarios de sistema automatizado
            // En producción: consultar BD para contar transacciones en ventana de tiempo
            boolean esSistema = request.getUsuarioOrigen() != null
                && request.getUsuarioOrigen().startsWith("sys.");

            if (esSistema) {
                log.info("Regla FRECUENCIA '{}' activada: usuario de sistema {}", regla.getNombre(), request.getUsuarioOrigen());
            }
            return esSistema;

        } catch (Exception e) {
            log.error("Error evaluando regla FRECUENCIA {}: {}", regla.getId(), e.getMessage());
            return false;
        }
    }
}
