package co.edu.uan.fraudguard.analysis.service;

import co.edu.uan.fraudguard.analysis.client.RuleEngineClient;
import co.edu.uan.fraudguard.analysis.dto.EvaluationResult;
import co.edu.uan.fraudguard.analysis.model.Alerta;
import co.edu.uan.fraudguard.analysis.model.Transaccion;
import co.edu.uan.fraudguard.analysis.repository.AlertaRepository;
import co.edu.uan.fraudguard.analysis.repository.TransaccionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Servicio principal de análisis de fraude.
 *
 * Flujo:
 *   1. Escucha transactions.queue  →  ASÍNCRONO vía RabbitMQ
 *   2. Consulta Rule Engine        →  SÍNCRONO vía REST
 *   3. Si hay violaciones          →  crea alertas + publica en alerts.queue
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FraudAnalysisService {

    private final TransaccionRepository txRepo;
    private final AlertaRepository      alertaRepo;
    private final RuleEngineClient      ruleEngineClient;
    private final RabbitTemplate        rabbit;

    @Value("${fraudguard.queues.alerts}")
    private String alertsQueue;

    // ─────────────────────────────────────────────────────────────
    //  Escucha la cola de transacciones (ASÍNCRONO)
    // ─────────────────────────────────────────────────────────────
    @RabbitListener(queues = "${fraudguard.queues.transactions}")
    public void analyze(Long transaccionId) {
        log.info("Analizando transacción ID: {}", transaccionId);

        // 1. Obtener la transacción de la BD
        Transaccion tx = txRepo.findById(transaccionId).orElse(null);
        if (tx == null) {
            log.warn("Transacción {} no encontrada en BD", transaccionId);
            return;
        }

        // 2. Llamar al Rule Engine (SÍNCRONO)
        EvaluationResult result = ruleEngineClient.evaluate(tx);

        // 3. Procesar resultado
        if (result.isEsAномала()) {
            // Marcar transacción como anómala
            tx.setEstado(Transaccion.Estado.ANOMALA);
            txRepo.save(tx);

            // Crear una alerta por cada regla violada
            for (EvaluationResult.Violation v : result.getViolations()) {
                Alerta alerta = Alerta.builder()
                        .transaccionId(transaccionId)
                        .reglaId(v.getReglaId())
                        .tipo(v.getNombreRegla())
                        .descripcion(buildDescripcion(tx, v))
                        .nivelRiesgo(Alerta.NivelRiesgo.valueOf(v.getNivelRiesgo()))
                        .estado(Alerta.Estado.PENDIENTE)
                        .notificado(false)
                        .generadaEn(LocalDateTime.now())
                        .build();

                Alerta guardada = alertaRepo.save(alerta);

                // Publicar en cola de notificaciones (ASÍNCRONO)
                rabbit.convertAndSend(alertsQueue, guardada.getId());
                log.info("Alerta {} generada y publicada para transacción {}", guardada.getId(), transaccionId);
            }

        } else {
            log.info("Transacción {} clasificada como NORMAL", transaccionId);
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────────────────
    private String buildDescripcion(Transaccion tx, EvaluationResult.Violation v) {
        return String.format(
            "Regla '%s' activada — Transacción %s | Servicio: %s | Monto: $%s | Usuario: %s",
            v.getNombreRegla(),
            tx.getReferencia(),
            tx.getServicio(),
            tx.getMonto(),
            tx.getUsuarioOrigen()
        );
    }
}
