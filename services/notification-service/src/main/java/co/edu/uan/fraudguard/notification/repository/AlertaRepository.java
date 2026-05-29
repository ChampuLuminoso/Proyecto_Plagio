package co.edu.uan.fraudguard.notification.repository;

import co.edu.uan.fraudguard.notification.model.Alerta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertaRepository extends JpaRepository<Alerta, Long> {
}
