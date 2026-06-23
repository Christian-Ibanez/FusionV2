package com.SanosySalvos.IdentificacioAcceso.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.SanosySalvos.IdentificacioAcceso.dto.LoginRequest;
import com.SanosySalvos.IdentificacioAcceso.dto.RegistroRequest;
import com.SanosySalvos.IdentificacioAcceso.model.RolModel;
import com.SanosySalvos.IdentificacioAcceso.service.AutenticacionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AutenticacionController.class)
@AutoConfigureMockMvc(addFilters = false) // Deshabilita filtros de seguridad para la prueba del controlador
public class AutenticacionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AutenticacionService autenticacionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registrarUsuario_RetornaBadRequest_ConMensaje_SiFalla() throws Exception {
        // Arrange
        RegistroRequest request = new RegistroRequest();
        request.setCorreo("duplicado@test.com");
        request.setContrasena("123");
        request.setRol(RolModel.USUARIO);

        doThrow(new RuntimeException("Este correo ya está en uso. ¿Deseas iniciar sesión?"))
                .when(autenticacionService).registrarUsuario(any(RegistroRequest.class));

        // Act & Assert
        mockMvc.perform(post("/api/auth/registro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Este correo ya está en uso. ¿Deseas iniciar sesión?"));
    }

    @Test
    void registrarUsuario_RetornaCreated_SiExito() throws Exception {
        // Arrange
        RegistroRequest request = new RegistroRequest();
        request.setCorreo("nuevo@test.com");
        request.setContrasena("123");
        request.setRol(RolModel.USUARIO);

        // Act & Assert
        mockMvc.perform(post("/api/auth/registro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(content().string("Usuario registrado exitosamente"));
    }

    @Test
    void iniciarSesion_RetornaUnauthorized_ConMensaje_SiFalla() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setCorreo("fail@test.com");
        request.setContrasena("wrongpass");

        when(autenticacionService.autenticarUsuario(any(LoginRequest.class)))
                .thenThrow(new RuntimeException("Credenciales inválidas"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Credenciales inválidas"));
    }

    @Test
    void iniciarSesion_RetornaOk_ConToken_SiExito() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setCorreo("ok@test.com");
        request.setContrasena("123");

        when(autenticacionService.autenticarUsuario(any(LoginRequest.class)))
                .thenReturn("fake-jwt-token");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"token\":\"fake-jwt-token\"}"));
    }
}
