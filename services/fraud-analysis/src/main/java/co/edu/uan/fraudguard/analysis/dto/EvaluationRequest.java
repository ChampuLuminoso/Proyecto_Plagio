package co.edu.uan.fraudguard.analysis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Datos que se envían al Rule Engine para evaluar una transacción.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EvaluationRequest {
    private Long          transaccionId;
    private String        servicio;
    private BigDecimal    monto;
    private String        usuarioOrigen;
    private String        ipOrigen;
    private LocalDateTime procesadaEn;
}
