package co.edu.uan.fraudguard.ruleengine.dto;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EvaluationResult {
    private Long             transaccionId;
    private boolean          esAномала;
    private List<Violation>  violations;
    private String           nivelRiesgoMax;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Violation {
        private Long   reglaId;
        private String nombreRegla;
        private String tipoRegla;
        private String nivelRiesgo;
    }
}
