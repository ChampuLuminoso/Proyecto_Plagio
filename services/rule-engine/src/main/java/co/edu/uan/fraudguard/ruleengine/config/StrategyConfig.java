package co.edu.uan.fraudguard.ruleengine.config;

import co.edu.uan.fraudguard.ruleengine.strategy.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.Map;

/**
 * Registra todas las estrategias en un Map<String, RuleStrategy>.
 * Spring inyecta este mapa en el RuleEngineService automáticamente.
 * La clave es el nombre del tipo de regla (MONTO, FRECUENCIA, etc.)
 */
@Configuration
public class StrategyConfig {

    @Bean
    public Map<String, RuleStrategy> strategies(
            MontoStrategy     montoStrategy,
            FrecuenciaStrategy frecuenciaStrategy,
            HorarioStrategy   horarioStrategy,
            AccesoStrategy    accesoStrategy,
            PatronStrategy    patronStrategy) {

        return Map.of(
            "MONTO",      montoStrategy,
            "FRECUENCIA", frecuenciaStrategy,
            "HORARIO",    horarioStrategy,
            "ACCESO",     accesoStrategy,
            "PATRON",     patronStrategy
        );
    }
}
