package com.SanosySalvos.Reportes.service;

import com.SanosySalvos.Reportes.dto.AnalisisRequestDTO;
import com.SanosySalvos.Reportes.dto.ReporteCruzeDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class CoincidenciaClientTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private CoincidenciaClient coincidenciaClient;

    @Test
    void enviarParaAnalisis_DebeLlamarAPostForObject() {
        AnalisisRequestDTO request = new AnalisisRequestDTO();
        
        coincidenciaClient.enviarParaAnalisis(request);
        
        // Verificamos que el RestTemplate intentó hacer el POST exactamente 1 vez
        verify(restTemplate, times(1)).postForObject(anyString(), eq(request), eq(String.class));
    }

    @Test
    void analizarFallback_DebeEjecutarseCorrectamente() {
        // Preparamos los DTOs porque el fallback imprime el ID del reporte nuevo
        AnalisisRequestDTO request = new AnalisisRequestDTO();
        ReporteCruzeDTO reporteNuevo = new ReporteCruzeDTO();
        reporteNuevo.setId(10L);
        request.setReporteNuevo(reporteNuevo);

        // Llamamos al fallback (cubriendo el System.out.println)
        coincidenciaClient.analizarFallback(request, new RuntimeException("Motor apagado simulado"));
        
        // Como es un método void, la prueba pasa exitosamente si no lanza excepciones
    }
}