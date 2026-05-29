package co.edu.uan.fraudguard.ruleengine.repository;

import co.edu.uan.fraudguard.ruleengine.model.Regla;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReglaRepository extends JpaRepository<Regla, Long> {
    List<Regla> findByActivaTrue();
}
