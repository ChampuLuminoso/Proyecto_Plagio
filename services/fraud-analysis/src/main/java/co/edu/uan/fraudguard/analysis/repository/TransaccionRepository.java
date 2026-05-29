package co.edu.uan.fraudguard.analysis.repository;

import co.edu.uan.fraudguard.analysis.model.Transaccion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {
}
