package com.SanosySalvos.Reportes.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.SanosySalvos.Reportes.dto.ReporteRequestDTO;
import com.SanosySalvos.Reportes.dto.ReporteResponseDTO;
import com.SanosySalvos.Reportes.model.EstadoReporte;
import com.SanosySalvos.Reportes.model.TipoReporte;
import com.SanosySalvos.Reportes.service.ReporteService;

import tools.jackson.databind.ObjectMapper;

// Le decimos a Spring que levante solo el entorno web para este controlador
@WebMvcTest(ReporteController.class)
public class ReporteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // Instanciado manualmente para evitar el error de UnsatisfiedDependencyException
    private ObjectMapper objectMapper = new ObjectMapper();

    // Usamos la nueva anotación de Spring Boot para crear el doble del servicio
    @MockitoBean
    private ReporteService reporteService;

    private ReporteResponseDTO responseFalsa;

    @BeforeEach
    void setUp() {
        // Preparamos una respuesta exitosa falsa para que el controlador la devuelva
        responseFalsa = new ReporteResponseDTO();
        responseFalsa.setId(10L);
        responseFalsa.setUsuarioId(1L);
        responseFalsa.setTipoReporte(TipoReporte.PERDIDO);
        responseFalsa.setEstado(EstadoReporte.ACTIVO);
        responseFalsa.setTitulo("Perrito perdido en el parque");
    }

    @Test
    void crearReporte_DebeRetornar201() throws Exception {
        ReporteRequestDTO requestDTO = new ReporteRequestDTO();
        requestDTO.setUsuarioId(1L);
        requestDTO.setTipoReporte(TipoReporte.PERDIDO);
        requestDTO.setTitulo("Perrito perdido en el parque");
        
        when(reporteService.crearReporte(any(ReporteRequestDTO.class))).thenReturn(responseFalsa);

        mockMvc.perform(post("/api/reportes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                
                .andExpect(status().isCreated()) // Esperamos HTTP 201
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.titulo").value("Perrito perdido en el parque"));
    }

    @Test
    void obtenerReportesActivos_DebeRetornar200YLista() throws Exception {
        when(reporteService.obtenerReportesActivos()).thenReturn(List.of(responseFalsa));

        mockMvc.perform(get("/api/reportes/activos")
                .contentType(MediaType.APPLICATION_JSON))
                
                .andExpect(status().isOk()) // Esperamos HTTP 200
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].estado").value("ACTIVO"));
    }

    @Test
    void marcarComoResuelto_DebeRetornar200() throws Exception {
        responseFalsa.setEstado(EstadoReporte.RESUELTO);
        
        // Simulamos que al llamar al servicio con ID de reporte 10 y ID de usuario 1, responde con éxito
        when(reporteService.marcarComoResuelto(eq(10L), eq(1L))).thenReturn(responseFalsa);

        mockMvc.perform(put("/api/reportes/10/resolver")
                .param("usuarioId", "1") // Agregamos el RequestParam
                .contentType(MediaType.APPLICATION_JSON))
                
                .andExpect(status().isOk()) // Esperamos HTTP 200
                .andExpect(jsonPath("$.estado").value("RESUELTO"));
    }
}