package co.edu.uan.fraudguard.alertquery.service;

import co.edu.uan.fraudguard.alertquery.model.Alerta;
import co.edu.uan.fraudguard.alertquery.repository.AlertaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AlertQueryService {

    private final AlertaRepository alertaRepo;

    public Page<Alerta> findAll(String estado, String riesgo, Pageable pageable) {
        Alerta.Estado      estadoEnum = estado != null ? Alerta.Estado.valueOf(estado)           : null;
        Alerta.NivelRiesgo riesgoEnum = riesgo != null ? Alerta.NivelRiesgo.valueOf(riesgo)      : null;
        return alertaRepo.findByFiltros(estadoEnum, riesgoEnum, pageable);
    }

    public Optional<Alerta> findById(Long id) {
        return alertaRepo.findById(id);
    }

    public Alerta updateEstado(Long id, String nuevoEstado) {
        Alerta alerta = alertaRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Alerta no encontrada: " + id));
        alerta.setEstado(Alerta.Estado.valueOf(nuevoEstado));
        alerta.setRevisadaEn(LocalDateTime.now());
        return alertaRepo.save(alerta);
    }

    public Map<String, Object> getSummary() {
        long pendientes = alertaRepo.countByEstado(Alerta.Estado.PENDIENTE);
        long revisadas  = alertaRepo.countByEstado(Alerta.Estado.REVISADO);
        long cerradas   = alertaRepo.countByEstado(Alerta.Estado.CERRADO);
        long alto       = alertaRepo.countByNivelRiesgo(Alerta.NivelRiesgo.ALTO);
        long medio      = alertaRepo.countByNivelRiesgo(Alerta.NivelRiesgo.MEDIO);
        long bajo       = alertaRepo.countByNivelRiesgo(Alerta.NivelRiesgo.BAJO);
        long total      = alertaRepo.count();

        return Map.of(
            "total",      total,
            "pendientes", pendientes,
            "revisadas",  revisadas,
            "cerradas",   cerradas,
            "riesgoAlto", alto,
            "riesgoMedio", medio,
            "riesgoBajo", bajo
        );
    }
}
