package com.SanosySalvos.Geolocalizacion.service;

import com.SanosySalvos.Geolocalizacion.model.Reporte;
import com.SanosySalvos.Geolocalizacion.repository.ReporteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GeolocalizacionServiceTest {

    @Mock
    private ReporteRepository reporteRepository;

    @InjectMocks
    private GeolocalizacionService geolocalizacionService;

    private Reporte reportePerdida;
    private Reporte reporteHallazgo;

    @BeforeEach
    void setUp() {
        reportePerdida = new Reporte(1L, "PERDIDA", "ACTIVO", 10.0, 20.0, LocalDateTime.now());
        reporteHallazgo = new Reporte(2L, "HALLAZGO", "ACTIVO", 10.01, 20.01, LocalDateTime.now());
    }

    @Test
    void obtenerReportesCercanos() {
        when(reporteRepository.findActivosCercanos(10.0, 20.0, 5.0))
                .thenReturn(Arrays.asList(reportePerdida, reporteHallazgo));

        List<Reporte> result = geolocalizacionService.obtenerReportesCercanos(10.0, 20.0);

        assertEquals(2, result.size());
        verify(reporteRepository, times(1)).findActivosCercanos(10.0, 20.0, 5.0);
    }

    @Test
    void obtenerReportesPorFechas() {
        LocalDateTime inicio = LocalDateTime.now().minusDays(1);
        LocalDateTime fin = LocalDateTime.now().plusDays(1);
        when(reporteRepository.findByFechaCreacionBetween(inicio, fin))
                .thenReturn(Arrays.asList(reportePerdida));

        List<Reporte> result = geolocalizacionService.obtenerReportesPorFechas(inicio, fin);

        assertEquals(1, result.size());
        verify(reporteRepository, times(1)).findByFechaCreacionBetween(inicio, fin);
    }

    @Test
    void buscarCoincidenciasGeograficas_Exitoso() {
        when(reporteRepository.findById(1L)).thenReturn(Optional.of(reportePerdida));
        when(reporteRepository.findCercanosPorTipo(10.0, 20.0, 2.0, "HALLAZGO"))
                .thenReturn(Arrays.asList(reporteHallazgo));

        List<Reporte> result = geolocalizacionService.buscarCoincidenciasGeograficas(1L);

        assertEquals(1, result.size());
        assertEquals("HALLAZGO", result.get(0).getTipo());
        verify(reporteRepository, times(1)).findById(1L);
        verify(reporteRepository, times(1)).findCercanosPorTipo(10.0, 20.0, 2.0, "HALLAZGO");
    }

    @Test
    void buscarCoincidenciasGeograficas_ReporteNoEncontrado() {
        when(reporteRepository.findById(1L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            geolocalizacionService.buscarCoincidenciasGeograficas(1L);
        });

        assertEquals("Reporte de pérdida no encontrado o tipo inválido.", exception.getMessage());
        verify(reporteRepository, times(1)).findById(1L);
        verify(reporteRepository, never()).findCercanosPorTipo(anyDouble(), anyDouble(), anyDouble(), anyString());
    }

    @Test
    void buscarCoincidenciasGeograficas_TipoInvalido() {
        Reporte reporteInvalido = new Reporte(1L, "OTRO", "ACTIVO", 10.0, 20.0, LocalDateTime.now());
        when(reporteRepository.findById(1L)).thenReturn(Optional.of(reporteInvalido));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            geolocalizacionService.buscarCoincidenciasGeograficas(1L);
        });

        assertEquals("Reporte de pérdida no encontrado o tipo inválido.", exception.getMessage());
        verify(reporteRepository, times(1)).findById(1L);
        verify(reporteRepository, never()).findCercanosPorTipo(anyDouble(), anyDouble(), anyDouble(), anyString());
    }

    @Test
    void guardarReporte_ConFechaYEstadoNulos() {
        Reporte nuevoReporte = new Reporte();
        nuevoReporte.setTipo("PERDIDA");
        nuevoReporte.setLatitud(10.0);
        nuevoReporte.setLongitud(20.0);

        when(reporteRepository.save(any(Reporte.class))).thenAnswer(invocation -> {
            Reporte r = invocation.getArgument(0);
            r.setId(3L);
            return r;
        });

        Reporte guardado = geolocalizacionService.guardarReporte(nuevoReporte);

        assertNotNull(guardado.getId());
        assertNotNull(guardado.getFechaCreacion());
        assertEquals("ACTIVO", guardado.getEstado());
        verify(reporteRepository, times(1)).save(any(Reporte.class));
    }

    @Test
    void guardarReporte_ConFechaYEstadoExistentes() {
        LocalDateTime fecha = LocalDateTime.now().minusDays(2);
        Reporte reporteExistente = new Reporte(4L, "HALLAZGO", "INACTIVO", 15.0, 25.0, fecha);

        when(reporteRepository.save(any(Reporte.class))).thenReturn(reporteExistente);

        Reporte guardado = geolocalizacionService.guardarReporte(reporteExistente);

        assertEquals(fecha, guardado.getFechaCreacion());
        assertEquals("INACTIVO", guardado.getEstado());
        verify(reporteRepository, times(1)).save(reporteExistente);
    }
}
