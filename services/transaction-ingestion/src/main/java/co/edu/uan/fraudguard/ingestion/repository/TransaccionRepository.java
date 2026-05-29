package co.edu.uan.fraudguard.ingestion.repository;

import co.edu.uan.fraudguard.ingestion.model.Transaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {
    Optional<Transaccion> findByReferencia(String referencia);
}
