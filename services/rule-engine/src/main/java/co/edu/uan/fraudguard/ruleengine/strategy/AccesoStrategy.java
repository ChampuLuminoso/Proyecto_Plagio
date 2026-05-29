package co.edu.uan.fraudguard.ruleengine.strategy;

import co.edu.uan.fraudguard.ruleengine.dto.EvaluationRequest;
import co.edu.uan.fraudguard.ruleengine.model.Regla;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Detecta accesos no autorizados por IP desconocida o dominio externo.
 * Parámetros: { "max_intentos": 3, "ventana_minutos": 5 }
 * En prototipo: detecta IPs externas (no en rango 10.0.x.x de la UAN)
 * o emails de dominio externo a @uan.edu.co
 */
@Slf4j
@Component("ACCESO")
public class AccesoStrategy implements RuleStrategy {

    private static final String DOMINIO_UAN    = "@uan.edu.co";
    private static final String RED_INTERNA    = "10.0.";

    @Override
    public boolean applies(EvaluationRequest request, Regla regla) {
        try {
            boolean usuarioExterno = request.getUsuarioOrigen() != null
                && !request.getUsuarioOrigen().endsWith(DOMINIO_UAN);

            boolean ipExterna = request.getIpOrigen() != null
                && !request.getIpOrigen().startsWith(RED_INTERNA);

            boolean sospechoso = usuarioExterno && ipExterna;

            if (sospechoso) {
                log.info("Regla ACCESO '{}' activada: usuario {} desde IP {}",
                    regla.getNombre(), request.getUsuarioOrigen(), request.getIpOrigen());
            }
            return sospechoso;

        } catch (Exception e) {
            log.error("Error evaluando regla ACCESO {}: {}", regla.getId(), e.getMessage());
            return false;
        }
    }
}
