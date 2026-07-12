package com.SanosySalvos.Notificaciones.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.SanosySalvos.Notificaciones.dto.ClinicaAprobadaRequest;
import com.SanosySalvos.Notificaciones.dto.NotificacionRequest;
import com.SanosySalvos.Notificaciones.model.NotificacionModel;
import com.SanosySalvos.Notificaciones.service.NotificacionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificacionController.class)
public class NotificacionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificacionService notificacionService;

    @MockBean
    private com.SanosySalvos.Notificaciones.repository.NotificacionRepository notificacionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void procesarCoincidencia_RetornaOk() throws Exception {
        NotificacionRequest request = new NotificacionRequest();
        request.setCorreoDueno("test@test.com");

        doNothing().when(notificacionService).procesarCoincidencia(any(NotificacionRequest.class));

        mockMvc.perform(post("/api/notificaciones/coincidencia")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Alerta procesada y notificaciones enviadas si corresponde."));
    }

    @Test
    void procesarAprobacionClinica_RetornaOk() throws Exception {
        ClinicaAprobadaRequest request = new ClinicaAprobadaRequest();
        request.setCorreoClinica("clinica@test.com");

        doNothing().when(notificacionService).procesarAprobacionClinica(any(ClinicaAprobadaRequest.class));

        mockMvc.perform(post("/api/notificaciones/clinica/aprobada")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Notificación de aprobación enviada a la clínica."));
    }

    @Test
    void obtenerHistorial_RetornaListaNotificaciones() throws Exception {
        NotificacionModel notif1 = new NotificacionModel();
        notif1.setTitulo("Notif 1");
        
        when(notificacionService.obtenerHistorial("test@test.com")).thenReturn(Arrays.asList(notif1));

        mockMvc.perform(get("/api/notificaciones/test@test.com"))
                .andExpect(status().isOk())
                .andExpect(content().json("[{\"titulo\":\"Notif 1\"}]"));
    }

    @Test
    void recibirNotificacion_RetornaOk() throws Exception {
        com.SanosySalvos.Notificaciones.dto.NotificacionSimpleRequestDTO request = new com.SanosySalvos.Notificaciones.dto.NotificacionSimpleRequestDTO();
        request.setUsuarioId(123L);
        request.setMensaje("Test message");

        when(notificacionRepository.save(any(NotificacionModel.class))).thenAnswer(i -> i.getArguments()[0]);

        mockMvc.perform(post("/api/notificaciones/enviar")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Notificación simple procesada correctamente."));
    }
}
