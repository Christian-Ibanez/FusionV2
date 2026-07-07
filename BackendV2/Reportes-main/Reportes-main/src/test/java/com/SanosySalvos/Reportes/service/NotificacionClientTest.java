package com.SanosySalvos.Reportes.service;

import com.SanosySalvos.Reportes.dto.NotificacionRequestDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class NotificacionClientTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private NotificacionClient notificacionClient;

    @BeforeEach
    public void setup() {
        ReflectionTestUtils.setField(notificacionClient, "notificacionServiceUrl", "http://localhost");
    }

    @Test
    public void testEnviarNotificacion() {
        NotificacionRequestDTO req = new NotificacionRequestDTO();
        req.setUsuarioId(1L);
        notificacionClient.enviarNotificacion(req);
        verify(restTemplate, times(1)).postForObject(eq("http://localhost/api/notificaciones/enviar"), any(), eq(String.class));
    }

    @Test
    public void testEnviarFallback() {
        NotificacionRequestDTO req = new NotificacionRequestDTO();
        req.setUsuarioId(1L);
        notificacionClient.enviarFallback(req, new RuntimeException("Error simulado"));
        // Only logs, nothing to verify besides no exceptions
    }
}
