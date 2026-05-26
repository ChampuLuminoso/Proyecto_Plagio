package co.edu.uan.fraudguard.ingestion.controller;

import co.edu.uan.fraudguard.ingestion.dto.TransactionRequest;
import co.edu.uan.fraudguard.ingestion.model.Transaccion;
import co.edu.uan.fraudguard.ingestion.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService service;

    /** Recibe una transacción desde el sistema de pagos UAN */
    @PostMapping
    public ResponseEntity<Transaccion> receive(@RequestBody TransactionRequest request) {
        Transaccion saved = service.receive(request);
        return ResponseEntity.ok(saved);
    }

    /** Lista el historial de transacciones */
    @GetMapping
    public ResponseEntity<List<Transaccion>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    /** Consulta una transacción por referencia */
    @GetMapping("/{referencia}")
    public ResponseEntity<Transaccion> getByRef(@PathVariable String referencia) {
        return service.findByReferencia(referencia)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
