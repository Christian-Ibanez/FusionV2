package com.SanosySalvos.Notificaciones.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.SanosySalvos.Notificaciones.dto.PreferenciaRequest;
import com.SanosySalvos.Notificaciones.model.PreferenciaUsuarioModel;
import com.SanosySalvos.Notificaciones.repository.PreferenciaUsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PreferenciaController.class)
public class PreferenciaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PreferenciaUsuarioRepository preferenciaRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void actualizarPreferencias_RetornaOk() throws Exception {
        PreferenciaRequest request = new PreferenciaRequest();
        request.setRecibirCorreos(false);

        when(preferenciaRepository.findByCorreoUsuario("test@test.com")).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/preferencias/test@test.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Preferencias actualizadas."));
    }

    @Test
    void obtenerPreferencias_RetornaPreferencia() throws Exception {
        PreferenciaUsuarioModel pref = new PreferenciaUsuarioModel();
        pref.setCorreoUsuario("test@test.com");
        pref.setRecibirCorreos(false);

        when(preferenciaRepository.findByCorreoUsuario("test@test.com")).thenReturn(Optional.of(pref));

        mockMvc.perform(get("/api/preferencias/test@test.com"))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"correoUsuario\":\"test@test.com\",\"recibirCorreos\":false}"));
    }
}
