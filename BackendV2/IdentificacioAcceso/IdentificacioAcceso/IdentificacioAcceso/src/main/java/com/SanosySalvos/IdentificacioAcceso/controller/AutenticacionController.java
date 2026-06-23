package com.SanosySalvos.IdentificacioAcceso.controller;

import com.SanosySalvos.IdentificacioAcceso.dto.AuthResponse;
import com.SanosySalvos.IdentificacioAcceso.dto.LoginRequest;
import com.SanosySalvos.IdentificacioAcceso.dto.RegistroRequest;
import com.SanosySalvos.IdentificacioAcceso.service.AutenticacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AutenticacionController {

    @Autowired
    private AutenticacionService autenticacionService;

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody RegistroRequest peticion) {
        try {
            autenticacionService.registrarUsuario(peticion);
            return ResponseEntity.status(HttpStatus.CREATED).body(java.util.Map.of("message", "Usuario registrado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> iniciarSesion(@RequestBody LoginRequest peticion) {
        try {
            String token = autenticacionService.autenticarUsuario(peticion);
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("message", e.getMessage()));
        }
    }
}
