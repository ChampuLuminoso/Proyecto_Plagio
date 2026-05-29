package co.edu.uan.fraudguard.analysis.client;

import co.edu.uan.fraudguard.analysis.dto.EvaluationRequest;
import co.edu.uan.fraudguard.analysis.dto.EvaluationResult;
import co.edu.uan.fraudguard.analysis.model.Transaccion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Cliente REST que llama al Rule Engine de forma SÍNCRONA.
 * Convierte la entidad Transaccion en un EvaluationRequest
 * y retorna el resultado con las violaciones encontradas.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RuleEngineClient {

    private final RestTemplate restTemplate;

    @Value("${fraudguard.rule-engine.url:http://rule-engine:8083}")
    private String ruleEngineUrl;

    public EvaluationResult evaluate(Transaccion tx) {
        String url = ruleEngineUrl + "/api/v1/rules/evaluate";

        EvaluationRequest request = EvaluationRequest.builder()
                .transaccionId(tx.getId())
                .servicio(tx.getServicio().name())
                .monto(tx.getMonto())
                .usuarioOrigen(tx.getUsuarioOrigen())
                .ipOrigen(tx.getIpOrigen())
                .procesadaEn(tx.getProcesadaEn())
                .build();

        log.info("Consultando Rule Engine para transacción ID {}", tx.getId());

        EvaluationResult result = restTemplate.postForObject(url, request, EvaluationResult.class);

        if (result == null) {
            log.warn("Rule Engine devolvió respuesta nula para transacción {}", tx.getId());
            return EvaluationResult.builder()
                    .transaccionId(tx.getId())
                    .esAномала(false)
                    .nivelRiesgoMax("BAJO")
                    .build();
        }

        return result;
    }
}
