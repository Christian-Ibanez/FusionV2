package com.SanosySalvos.Reportes.service;

import com.SanosySalvos.Reportes.dto.AnalisisRequestDTO;
import com.SanosySalvos.Reportes.dto.ReporteRequestDTO;
import com.SanosySalvos.Reportes.dto.ReporteResponseDTO;
import com.SanosySalvos.Reportes.model.EstadoReporte;
import com.SanosySalvos.Reportes.model.Reporte;
import com.SanosySalvos.Reportes.model.TipoReporte;
import com.SanosySalvos.Reportes.repository.ReporteRepository;
import com.SanosySalvos.Reportes.service.impl.ReporteServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReporteServiceImplTest {

    @Mock
    private ReporteRepository reporteRepository;

    // 1. Agregamos los Mocks faltantes para los clientes Feign/HTTP
    @Mock
    private UsuarioClient usuarioClient;

    @Mock
    private CoincidenciaClient coincidenciaClient;

    @InjectMocks
    private ReporteServiceImpl reporteService;

    private Reporte reporteActivo;
    private ReporteRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        reporteActivo = new Reporte();
        reporteActivo.setId(1L);
        reporteActivo.setUsuarioId(10L);
        reporteActivo.setMascotaId(5L);
        reporteActivo.setTitulo("Perrito perdido");
        reporteActivo.setEstado(EstadoReporte.ACTIVO);
        reporteActivo.setTipoReporte(TipoReporte.PERDIDO);
        reporteActivo.setLatitud(-36.82);
        reporteActivo.setLongitud(-73.04);
        reporteActivo.setFechaCreacion(LocalDateTime.now());

        requestDTO = new ReporteRequestDTO();
        requestDTO.setUsuarioId(10L);
        requestDTO.setMascotaId(5L);
        requestDTO.setTitulo("Perrito perdido");
        requestDTO.setTipoReporte(TipoReporte.PERDIDO);
        requestDTO.setLatitud(-36.82);
        requestDTO.setLongitud(-73.04);
    }

    // --- TESTS PARA CREAR REPORTE ---

    @Test
    void crearReporte_Exito() {
        // Arrange: Le decimos a los mocks cómo deben comportarse
        when(usuarioClient.verificarUsuarioExterno(requestDTO.getUsuarioId())).thenReturn(true); // El usuario existe
        when(reporteRepository.save(any(Reporte.class))).thenReturn(reporteActivo);
        when(reporteRepository.findByTipoReporte(any(TipoReporte.class))).thenReturn(Collections.emptyList()); // Sin candidatos por ahora

        // Act
        ReporteResponseDTO response = reporteService.crearReporte(requestDTO);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Perrito perdido", response.getTitulo());
        
        // Verificamos que se llamó a la base de datos y al microservicio de coincidencias
        verify(reporteRepository, times(1)).save(any(Reporte.class));
        verify(coincidenciaClient, times(1)).enviarParaAnalisis(any(AnalisisRequestDTO.class));
    }

    @Test
    void crearReporte_ReporteEncontrado_ProcesaCandidatos() {
        // Arrange: Hacemos que el nuevo reporte sea ENCONTRADO
        requestDTO.setTipoReporte(TipoReporte.ENCONTRADO);
        reporteActivo.setTipoReporte(TipoReporte.ENCONTRADO);
        
        // Creamos un candidato PERDIDO para simular un posible "Match"
        Reporte candidatoFalso = new Reporte();
        candidatoFalso.setId(2L);
        candidatoFalso.setTipoReporte(TipoReporte.PERDIDO);
        candidatoFalso.setLatitud(-36.0);
        candidatoFalso.setLongitud(-73.0);
        
        when(usuarioClient.verificarUsuarioExterno(requestDTO.getUsuarioId())).thenReturn(true);
        when(reporteRepository.save(any(Reporte.class))).thenReturn(reporteActivo);
        when(reporteRepository.findByTipoReporte(TipoReporte.PERDIDO)).thenReturn(List.of(candidatoFalso));

        // Act
        ReporteResponseDTO response = reporteService.crearReporte(requestDTO);

        // Assert
        assertNotNull(response);
        verify(coincidenciaClient, times(1)).enviarParaAnalisis(any(AnalisisRequestDTO.class));
    }

    @Test
    void crearReporte_LanzaExcepcion_SiUsuarioEsNulo() {
        // Arrange
        requestDTO.setUsuarioId(null);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            reporteService.crearReporte(requestDTO);
        });

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(usuarioClient, never()).verificarUsuarioExterno(anyLong()); // Nunca debe llegar a consultar al otro microservicio
        verify(reporteRepository, never()).save(any(Reporte.class));
    }

    @Test
    void crearReporte_LanzaExcepcion_SiUsuarioNoExisteEnMicroservicio() {
        // Arrange: Simulamos que el microservicio de Usuarios responde "falso" (no existe)
        when(usuarioClient.verificarUsuarioExterno(requestDTO.getUsuarioId())).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            reporteService.crearReporte(requestDTO);
        });

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertTrue(exception.getReason().contains("El usuario indicado no existe"));
        verify(reporteRepository, never()).save(any(Reporte.class));
    }

    // --- TESTS PARA OBTENER ACTIVOS ---

    @Test
    void obtenerReportesActivos_Exito() {
        // Arrange
        when(reporteRepository.findByEstado(EstadoReporte.ACTIVO)).thenReturn(List.of(reporteActivo));

        // Act
        List<ReporteResponseDTO> response = reporteService.obtenerReportesActivos();

        // Assert
        assertFalse(response.isEmpty());
        assertEquals(1, response.size());
        assertEquals(EstadoReporte.ACTIVO, response.get(0).getEstado());
        verify(reporteRepository, times(1)).findByEstado(EstadoReporte.ACTIVO);
    }

    // --- TESTS PARA MARCAR COMO RESUELTO ---

    @Test
    void marcarComoResuelto_Exito() {
        // Arrange
        when(reporteRepository.findById(1L)).thenReturn(Optional.of(reporteActivo));
        when(reporteRepository.save(any(Reporte.class))).thenReturn(reporteActivo);

        // Act
        ReporteResponseDTO response = reporteService.marcarComoResuelto(1L, 10L);

        // Assert
        assertNotNull(response);
        assertEquals(EstadoReporte.RESUELTO, reporteActivo.getEstado());
        verify(reporteRepository, times(1)).save(reporteActivo);
    }

    @Test
    void marcarComoResuelto_LanzaExcepcion_SiNoEsDueno() {
        // Arrange
        when(reporteRepository.findById(1L)).thenReturn(Optional.of(reporteActivo));

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            reporteService.marcarComoResuelto(1L, 99L); // Intruso
        });

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verify(reporteRepository, never()).save(any(Reporte.class));
    }

    @Test
    void marcarComoResuelto_LanzaExcepcion_SiReporteNoExiste() {
        // Arrange
        when(reporteRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            reporteService.marcarComoResuelto(999L, 10L);
        });

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(reporteRepository, never()).save(any(Reporte.class));
    }
}