package co.edu.uan.fraudguard.ingestion.service;

import co.edu.uan.fraudguard.ingestion.dto.TransactionRequest;
import co.edu.uan.fraudguard.ingestion.model.Transaccion;
import co.edu.uan.fraudguard.ingestion.repository.TransaccionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransaccionRepository repo;
    private final RabbitTemplate rabbit;

    @Value("${fraudguard.queues.transactions}")
    private String transactionsQueue;

    /**
     * Recibe, persiste y publica la transacción en RabbitMQ
     * para que Fraud Analysis la consuma de forma asíncrona.
     */
    public Transaccion receive(TransactionRequest req) {
        long inicio = System.currentTimeMillis();

        // 1. Persistir con estado NORMAL por defecto
        Transaccion tx = new Transaccion();
        tx.setReferencia(req.getReferencia());
        tx.setServicio(req.getServicio());
        tx.setMonto(req.getMonto());
        tx.setUsuarioOrigen(req.getUsuarioOrigen());
        tx.setIpOrigen(req.getIpOrigen());
        tx.setEstado(Transaccion.Estado.NORMAL);
        tx.setProcesadaEn(LocalDateTime.now());
        tx.setLatenciaMs((int)(System.currentTimeMillis() - inicio));

        Transaccion saved = repo.save(tx);

        // 2. Publicar en cola RabbitMQ (asíncrono)
        rabbit.convertAndSend(transactionsQueue, saved.getId());
        log.info("Transacción {} publicada en cola -> ID {}", saved.getReferencia(), saved.getId());

        return saved;
    }

    public List<Transaccion> findAll() {
        return repo.findAll();
    }

    public Optional<Transaccion> findByReferencia(String ref) {
        return repo.findByReferencia(ref);
    }
}
