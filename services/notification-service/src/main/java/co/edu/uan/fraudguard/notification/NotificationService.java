package co.edu.uan.fraudguard.notification.service;

import co.edu.uan.fraudguard.notification.model.Alerta;
import co.edu.uan.fraudguard.notification.repository.AlertaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

/**
 * Escucha alerts.queue (ASÍNCRONO).
 * Notifica a los responsables según el nivel de riesgo.
 *
 * Flujo: alerta ALTO   → notifica a ADMIN + ANALISTA
 *        alerta MEDIO  → notifica a ANALISTA
 *        alerta BAJO   → registra en log
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final AlertaRepository alertaRepo;

    @RabbitListener(queues = "${fraudguard.queues.alerts}")
    public void notify(Long alertaId) {
        Alerta alerta = alertaRepo.findById(alertaId).orElse(null);
        if (alerta == null) {
            log.warn("Alerta {} no encontrada para notificar", alertaId);
            return;
        }

        switch (alerta.getNivelRiesgo()) {
            case ALTO -> {
                notifyAdmin(alerta);
                notifyAnalista(alerta);
                log.info("Alerta ALTO {} — Admin y Analista notificados", alertaId);
            }
            case MEDIO -> {
                notifyAnalista(alerta);
                log.info("Alerta MEDIO {} — Analista notificado", alertaId);
            }
            case BAJO -> {
                log.info("Alerta BAJO {} — registrada sin notificación inmediata", alertaId);
            }
        }

        // Marcar como notificada
        alerta.setNotificado(true);
        alertaRepo.save(alerta);
    }

    private void notifyAdmin(Alerta alerta) {
        // TODO: integrar email (JavaMailSender) o webhook
        log.info("[ADMIN] Alerta ID={} Tipo='{}' Riesgo={}", alerta.getId(), alerta.getTipo(), alerta.getNivelRiesgo());
    }

    private void notifyAnalista(Alerta alerta) {
        // TODO: integrar email o notificación push
        log.info("[ANALISTA] Alerta ID={} Tipo='{}' Riesgo={}", alerta.getId(), alerta.getTipo(), alerta.getNivelRiesgo());
    }
}
