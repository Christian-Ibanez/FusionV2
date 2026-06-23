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
}