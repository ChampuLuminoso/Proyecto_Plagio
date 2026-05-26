package co.edu.uan.fraudguard.alertquery.controller;

import co.edu.uan.fraudguard.alertquery.model.Alerta;
import co.edu.uan.fraudguard.alertquery.service.AlertQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Punto único de entrada externo al sistema.
 * Protegido con JWT — solo usuarios autenticados.
 * Rol ADMIN puede cerrar alertas; ANALISTA solo consulta.
 */
@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
public class AlertQueryController {

    private final AlertQueryService service;

    /** Lista alertas con paginación y filtro opcional por estado */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ANALISTA','TECNICO')")
    public ResponseEntity<Page<Alerta>> list(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String riesgo,
            Pageable pageable) {
        return ResponseEntity.ok(service.findAll(estado, riesgo, pageable));
    }

    /** Detalle de una alerta */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ANALISTA','TECNICO')")
    public ResponseEntity<Alerta> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Cambia el estado de una alerta (REVISADO / CERRADO) */
    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN','ANALISTA')")
    public ResponseEntity<Alerta> updateEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.updateEstado(id, body.get("estado")));
    }

    /** Resumen de KPIs para el dashboard */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','ANALISTA','TECNICO')")
    public ResponseEntity<Map<String, Object>> summary() {
        return ResponseEntity.ok(service.getSummary());
    }
}
