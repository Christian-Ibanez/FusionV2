package com.SanosySalvos.Geolocalizacion.controller;

import com.SanosySalvos.Geolocalizacion.model.Reporte;
import com.SanosySalvos.Geolocalizacion.service.GeolocalizacionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GeolocalizacionControllerTest {

    @Mock
    private GeolocalizacionService geolocalizacionService;

    @InjectMocks
    private GeolocalizacionController geolocalizacionController;

    private Reporte reporte;

    @BeforeEach
    void setUp() {
        reporte = new Reporte(1L, "PERDIDA", "ACTIVO", 10.0, 20.0, LocalDateTime.now());
    }

    @Test
    void obtenerReportesCercanos() {
        when(geolocalizacionService.obtenerReportesCercanos(10.0, 20.0))
                .thenReturn(Arrays.asList(reporte));

        ResponseEntity<List<Reporte>> response = geolocalizacionController.obtenerReportesCercanos(10.0, 20.0);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        verify(geolocalizacionService, times(1)).obtenerReportesCercanos(10.0, 20.0);
    }

    @Test
    void obtenerMapaCalorPorFechas() {
        LocalDateTime inicio = LocalDateTime.now().minusDays(1);
        LocalDateTime fin = LocalDateTime.now().plusDays(1);
        
        when(geolocalizacionService.obtenerReportesPorFechas(inicio, fin))
                .thenReturn(Arrays.asList(reporte));

        ResponseEntity<List<Reporte>> response = geolocalizacionController.obtenerMapaCalorPorFechas(inicio, fin);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        verify(geolocalizacionService, times(1)).obtenerReportesPorFechas(inicio, fin);
    }

    @Test
    void buscarCoincidencias_Exitoso() {
        when(geolocalizacionService.buscarCoincidenciasGeograficas(1L))
                .thenReturn(Arrays.asList(reporte));

        ResponseEntity<List<Reporte>> response = geolocalizacionController.buscarCoincidencias(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        verify(geolocalizacionService, times(1)).buscarCoincidenciasGeograficas(1L);
    }

    @Test
    void buscarCoincidencias_IllegalArgumentException() {
        when(geolocalizacionService.buscarCoincidenciasGeograficas(1L))
                .thenThrow(new IllegalArgumentException("Reporte de pérdida no encontrado o tipo inválido."));

        ResponseEntity<List<Reporte>> response = geolocalizacionController.buscarCoincidencias(1L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(geolocalizacionService, times(1)).buscarCoincidenciasGeograficas(1L);
    }

    @Test
    void crearReporte() {
        when(geolocalizacionService.guardarReporte(any(Reporte.class))).thenReturn(reporte);

        ResponseEntity<Reporte> response = geolocalizacionController.crearReporte(reporte);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(reporte.getId(), response.getBody().getId());
        verify(geolocalizacionService, times(1)).guardarReporte(reporte);
    }
}
