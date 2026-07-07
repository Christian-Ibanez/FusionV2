package com.SanosySalvos.Reportes.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UsuarioClientTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private UsuarioClient usuarioClient;

    @Test
    void verificarUsuarioExterno_DebeRetornarTrue_SiRespuestaNoEsNula() {
        // Simulamos que la petición GET devuelve cualquier objeto (el usuario existe)
        when(restTemplate.getForObject(anyString(), eq(Object.class))).thenReturn(new Object());
        
        boolean resultado = usuarioClient.verificarUsuarioExterno(1L);
        assertTrue(resultado);
    }

    @Test
    void verificarUsuarioExterno_DebeRetornarFalse_SiRespuestaEsNula() {
        // Simulamos que devuelve nulo (el usuario no existe)
        when(restTemplate.getForObject(anyString(), eq(Object.class))).thenReturn(null);
        
        boolean resultado = usuarioClient.verificarUsuarioExterno(1L);
        assertFalse(resultado);
    }

    @Test
    void verificarUsuarioFallback_DebeEjecutarseYRetornarTrue() {
        // Llamamos directamente al fallback para que JaCoCo lo marque como probado
        boolean resultado = usuarioClient.verificarUsuarioFallback(1L, new RuntimeException("Error simulado"));
        assertTrue(resultado);
    }

    @Test
    void obtenerCorreoUsuario_ConRespuestaValida() {
        java.util.Map<String, Object> mockResp = new java.util.HashMap<>();
        mockResp.put("correoElectronico", "test@test.com");
        when(restTemplate.getForObject(anyString(), eq(java.util.Map.class))).thenReturn(mockResp);
        
        String resultado = usuarioClient.obtenerCorreoUsuario(1L);
        assertEquals("test@test.com", resultado);
    }

    @Test
    void obtenerCorreoUsuario_ConRespuestaNula_RetornaId() {
        when(restTemplate.getForObject(anyString(), eq(java.util.Map.class))).thenReturn(null);
        
        String resultado = usuarioClient.obtenerCorreoUsuario(1L);
        assertEquals("1", resultado);
    }

    @Test
    void obtenerCorreoUsuarioFallback_DebeRetornarId() {
        String resultado = usuarioClient.obtenerCorreoUsuarioFallback(1L, new RuntimeException("Simulado"));
        assertEquals("1", resultado);
    }
}