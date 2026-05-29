package co.edu.uan.fraudguard.alertquery.service;

import co.edu.uan.fraudguard.alertquery.dto.LoginRequest;
import co.edu.uan.fraudguard.alertquery.dto.LoginResponse;
import co.edu.uan.fraudguard.alertquery.model.Usuario;
import co.edu.uan.fraudguard.alertquery.repository.UsuarioRepository;
import co.edu.uan.fraudguard.alertquery.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepo;
    private final PasswordEncoder   passwordEncoder;
    private final JwtUtil           jwtUtil;

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepo.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        if (!usuario.getActivo()) {
            throw new RuntimeException("Usuario inactivo");
        }

        String token = jwtUtil.generateToken(usuario.getEmail(), usuario.getRol().name());

        return LoginResponse.builder()
                .token(token)
                .rol(usuario.getRol().name())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .build();
    }
}
