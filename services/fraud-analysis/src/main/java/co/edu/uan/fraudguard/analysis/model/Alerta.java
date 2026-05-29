package co.edu.uan.fraudguard.analysis.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alertas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Alerta {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaccion_id")
    private Long transaccionId;

    @Column(name = "regla_id")
    private Long reglaId;

    @Column(nullable = false)
    private String tipo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_riesgo", nullable = false)
    private NivelRiesgo nivelRiesgo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Estado estado;

    @Column(nullable = false)
    private Boolean notificado;

    @Column(name = "generada_en", nullable = false)
    private LocalDateTime generadaEn;

    public enum NivelRiesgo { BAJO, MEDIO, ALTO }
    public enum Estado      { PENDIENTE, REVISADO, CERRADO }
}
