package com.SanosySalvos.Reportes.service;

import com.SanosySalvos.Reportes.dto.AnalisisRequestDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CoincidenciaClient {

    @Autowired
    private RestTemplate restTemplate;

    @CircuitBreaker(name = "servicioCoincidencias", fallbackMethod = "analizarFallback")
    public void enviarParaAnalisis(AnalisisRequestDTO request) {
        String url = "http://localhost:8082/api/coincidencias/analizar";
        restTemplate.postForObject(url, request, String.class);
    }

    public void analizarFallback(AnalisisRequestDTO request, Throwable e) {
        System.out.println("⚠️ ALERTA: Motor de Coincidencias apagado. El reporte " + request.getReporteNuevo().getId() + " se guardó, pero no se analizaron cruces. Motivo: " + e.getMessage());
    }
}