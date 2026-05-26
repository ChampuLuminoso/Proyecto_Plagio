package co.edu.uan.fraudguard.alertquery.controller;

import co.edu.uan.fraudguard.alertquery.dto.LoginRequest;
import co.edu.uan.fraudguard.alertquery.dto.LoginResponse;
import co.edu.uan.fraudguard.alertquery.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/v1/auth/login
     * Body: { "email": "...", "password": "..." }
     * Response: { "token": "eyJ...", "rol": "ANALISTA", "nombre": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
