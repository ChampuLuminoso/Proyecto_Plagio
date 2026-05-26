package co.edu.uan.fraudguard.ingestion.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transacciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Transaccion {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String referencia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Servicio servicio;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal monto;

    @Column(name = "usuario_origen", nullable = false)
    private String usuarioOrigen;

    @Column(name = "ip_origen")
    private String ipOrigen;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Estado estado;

    @Column(name = "latencia_ms")
    private Integer latenciaMs;

    @Column(name = "procesada_en", nullable = false)
    private LocalDateTime procesadaEn;

    public enum Servicio { MATRICULA, NOMINA, INSCRIPCION, PAGOS }
    public enum Estado   { NORMAL, ANOMALA, EN_REVISION }
}
