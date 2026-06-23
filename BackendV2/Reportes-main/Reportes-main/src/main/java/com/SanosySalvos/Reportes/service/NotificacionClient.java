package com.SanosySalvos.Reportes.service;

import com.SanosySalvos.Reportes.dto.NotificacionRequestDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class NotificacionClient {

    @Autowired
    private RestTemplate restTemplate;

    @CircuitBreaker(name = "servicioNotificaciones", fallbackMethod = "enviarFallback")
    public void enviarNotificacion(NotificacionRequestDTO request) {
        String url = "http://localhost:8083/api/notificaciones/enviar";
        restTemplate.postForObject(url, request, String.class);
    }

    public void enviarFallback(NotificacionRequestDTO request, Throwable e) {
        System.out.println("⚠️ ALERTA: Microservicio de Notificaciones apagado. La notificación para el usuario " + request.getUsuarioId() + " no pudo ser enviada. Motivo: " + e.getMessage());
    }
}
