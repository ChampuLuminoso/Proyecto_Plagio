package co.edu.uan.fraudguard.ruleengine.model;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity
@Table(name = "reglas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Regla {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoRegla tipo;

    @Column(nullable = false)
    private Boolean activa;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json", nullable = false)
    private JsonNode parametros;

    @Column(name = "creada_en", nullable = false)
    private LocalDateTime creadaEn;

    public enum TipoRegla { MONTO, FRECUENCIA, HORARIO, ACCESO, PATRON }
}
