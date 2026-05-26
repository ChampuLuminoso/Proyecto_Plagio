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
 * 1. Escucha transactions.queue (ASÍNCRONO via RabbitMQ)
 * 2. Consulta Rule Engine (SÍNCRONO via REST)
 * 3. Si hay violaciones → crea alertas y publica en alerts.queue
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FraudAnalysisService {

    private final TransaccionRepository txRepo;
    private final AlertaRepository alertaRepo;
    private final RuleEngineClient ruleEngineClient;
    private final RabbitTemplate rabbit;

    @Value("${fraudguard.queues.alerts}")
    private String alertsQueue;

    @RabbitListener(queues = "${fraudguard.queues.transactions}")
    public void analyze(Long transaccionId) {
        log.info("Analizando transacción ID: {}", transaccionId);

        Transaccion tx = txRepo.findById(transaccionId).orElse(null);
        if (tx == null) {
            log.warn("Transacción {} no encontrada", transaccionId);
            return;
        }

        // Llamada SÍNCRONA al Rule Engine
        EvaluationResult result = ruleEngineClient.evaluate(tx);

        if (result.isEsAномала()) {
            // Actualizar estado de la transacción
            tx.setEstado(Transaccion.Estado.ANOMALA);
            txRepo.save(tx);

            // Crear una alerta por cada regla violada
            for (EvaluationResult.Violation v : result.getViolations()) {
                Alerta alerta = new Alerta();
                alerta.setTransaccionId(transaccionId);
                alerta.setReglaId(v.getReglaId());
                alerta.setTipo(v.getNombreRegla());
                alerta.setDescripcion(buildDesc(tx, v));
                alerta.setNivelRiesgo(Alerta.NivelRiesgo.valueOf(v.getNivelRiesgo()));
                alerta.setEstado(Alerta.Estado.PENDIENTE);
                alerta.setNotificado(false);
                alerta.setGeneradaEn(LocalDateTime.now());
                Alerta saved = alertaRepo.save(alerta);

                // Publicar en cola de notificaciones (ASÍNCRONO)
                rabbit.convertAndSend(alertsQueue, saved.getId());
                log.info("Alerta {} generada y publicada en cola", saved.getId());
            }
        } else {
            log.info("Transacción {} clasificada como NORMAL", transaccionId);
        }
    }

    private String buildDesc(Transaccion tx, EvaluationResult.Violation v) {
        return String.format("Regla '%s' activada — Transacción %s de $%s por %s",
            v.getNombreRegla(), tx.getReferencia(), tx.getMonto(), tx.getUsuarioOrigen());
    }
}
