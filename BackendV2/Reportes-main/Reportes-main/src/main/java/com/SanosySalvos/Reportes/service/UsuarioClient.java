package com.SanosySalvos.Reportes.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class UsuarioClient {

    @Autowired
    private RestTemplate restTemplate;

    @CircuitBreaker(name = "servicioUsuarios", fallbackMethod = "verificarUsuarioFallback")
    public boolean verificarUsuarioExterno(Long usuarioId) {
        String url = "http://localhost:8080/api/usuarios/" + usuarioId;
        Object respuesta = restTemplate.getForObject(url, Object.class);
        return respuesta != null;
    }

    public boolean verificarUsuarioFallback(Long usuarioId, Throwable e) {
        System.out.println("⚠️ ALERTA CORTACIRCUITOS: No se pudo validar el usuario " + usuarioId + ". El microservicio está caído. Motivo: " + e.getMessage());
        return true; 
    }
}