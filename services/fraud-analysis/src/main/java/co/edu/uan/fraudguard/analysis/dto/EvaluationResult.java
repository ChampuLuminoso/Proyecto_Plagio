package co.edu.uan.fraudguard.analysis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Respuesta del Rule Engine con las reglas violadas y el nivel de riesgo máximo.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EvaluationResult {

    private Long          transaccionId;
    private boolean       esAномала;
    private List<Violation> violations;
    private String        nivelRiesgoMax;   // "BAJO" | "MEDIO" | "ALTO"

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Violation {
        private Long   reglaId;
        private String nombreRegla;
        private String tipoRegla;
        private String nivelRiesgo;
    }
}
