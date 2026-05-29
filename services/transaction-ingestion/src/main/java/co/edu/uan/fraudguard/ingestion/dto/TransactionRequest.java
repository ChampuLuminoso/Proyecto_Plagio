package co.edu.uan.fraudguard.ingestion.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransactionRequest {
    private String     referencia;
    private String     servicio;
    private BigDecimal monto;
    private String     usuarioOrigen;
    private String     ipOrigen;
}
