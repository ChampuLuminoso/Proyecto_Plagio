package co.edu.uan.fraudguard.ruleengine.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EvaluationRequest {
    private Long          transaccionId;
    private String        servicio;
    private BigDecimal    monto;
    private String        usuarioOrigen;
    private String        ipOrigen;
    private LocalDateTime procesadaEn;
}
