package co.edu.uan.fraudguard.alertquery.repository;

import co.edu.uan.fraudguard.alertquery.model.Alerta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AlertaRepository extends JpaRepository<Alerta, Long> {

    Page<Alerta> findByEstado(Alerta.Estado estado, Pageable pageable);

    Page<Alerta> findByNivelRiesgo(Alerta.NivelRiesgo nivelRiesgo, Pageable pageable);

    @Query("SELECT a FROM Alerta a WHERE " +
           "(:estado IS NULL OR a.estado = :estado) AND " +
           "(:riesgo IS NULL OR a.nivelRiesgo = :riesgo)")
    Page<Alerta> findByFiltros(
        @Param("estado") Alerta.Estado estado,
        @Param("riesgo") Alerta.NivelRiesgo riesgo,
        Pageable pageable
    );

    long countByEstado(Alerta.Estado estado);
    long countByNivelRiesgo(Alerta.NivelRiesgo nivelRiesgo);
}
