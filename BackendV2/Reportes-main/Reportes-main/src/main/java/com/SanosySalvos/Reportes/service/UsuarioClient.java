package com.SanosySalvos.Reportes.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class UsuarioClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${USUARIO_SERVICE_URL:http://localhost:8080}")
    private String usuarioServiceUrl;

    @CircuitBreaker(name = "servicioUsuarios", fallbackMethod = "verificarUsuarioFallback")
    public boolean verificarUsuarioExterno(Long usuarioId) {
        String url = usuarioServiceUrl + "/api/usuarios/" + usuarioId;
        Object respuesta = restTemplate.getForObject(url, Object.class);
        return respuesta != null;
    }

    public boolean verificarUsuarioFallback(Long usuarioId, Throwable e) {
        System.out.println("⚠️ ALERTA CORTACIRCUITOS: No se pudo validar el usuario " + usuarioId + ". El microservicio está caído. Motivo: " + e.getMessage());
        return true; 
    }

    @CircuitBreaker(name = "servicioUsuarios", fallbackMethod = "obtenerCorreoUsuarioFallback")
    public String obtenerCorreoUsuario(Long usuarioId) {
        String url = usuarioServiceUrl + "/api/usuarios/" + usuarioId;
        java.util.Map<String, Object> respuesta = restTemplate.getForObject(url, java.util.Map.class);
        if (respuesta != null && respuesta.containsKey("correoElectronico")) {
            return (String) respuesta.get("correoElectronico");
        }
        return String.valueOf(usuarioId);
    }

    public String obtenerCorreoUsuarioFallback(Long usuarioId, Throwable e) {
        System.out.println("⚠️ ALERTA CORTACIRCUITOS: No se pudo obtener correo del usuario " + usuarioId + ". Motivo: " + e.getMessage());
        return String.valueOf(usuarioId);
    }
}