package co.edu.uan.fraudguard.alertquery.repository;

import co.edu.uan.fraudguard.alertquery.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
}
