package com.SanosySalvos.Notificaciones.service;

import com.SanosySalvos.Notificaciones.dto.NotificacionRequest;
import com.SanosySalvos.Notificaciones.model.NotificacionModel;
import com.SanosySalvos.Notificaciones.dto.ClinicaAprobadaRequest;
import com.SanosySalvos.Notificaciones.model.PreferenciaUsuarioModel;
import com.SanosySalvos.Notificaciones.repository.NotificacionRepository;
import com.SanosySalvos.Notificaciones.repository.PreferenciaUsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
public class NotificacionServiceTest {

    @Mock
    private NotificacionRepository notificacionRepository;

    @Mock
    private PreferenciaUsuarioRepository preferenciaUsuarioRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private NotificacionService notificacionService;

    @Test
    void procesarCoincidencia_NoEnviaCorreo_SiPreferenciaEsFalse() {
        NotificacionRequest req = new NotificacionRequest();
        req.setCorreoDueno("test@test.com");

        PreferenciaUsuarioModel pref = new PreferenciaUsuarioModel();
        pref.setRecibirCorreos(false);
        pref.setRecibirPush(false);

        when(preferenciaUsuarioRepository.findByCorreoUsuario("test@test.com")).thenReturn(Optional.of(pref));

        notificacionService.procesarCoincidencia(req);

        // Verifica que se guarda en DB (HU-2: historial in-app)
        verify(notificacionRepository, times(1)).save(any(NotificacionModel.class));
        // Verifica que NO manda correo
        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString());
    }

    @Test
    void procesarCoincidencia_EnviaCorreo_SiPreferenciaEsTrue() {
        NotificacionRequest req = new NotificacionRequest();
        req.setCorreoDueno("test@test.com");

        PreferenciaUsuarioModel pref = new PreferenciaUsuarioModel();
        pref.setRecibirCorreos(true);
        pref.setRecibirPush(false);

        when(preferenciaUsuarioRepository.findByCorreoUsuario("test@test.com")).thenReturn(Optional.of(pref));

        notificacionService.procesarCoincidencia(req);

        verify(notificacionRepository, times(1)).save(any(NotificacionModel.class));
        verify(emailService, times(1)).sendEmail(eq("test@test.com"), anyString(), anyString());
    }

    @Test
    void procesarCoincidencia_UsaPreferenciasPorDefecto_SiNoExisteConfiguracion() {
        NotificacionRequest req = new NotificacionRequest();
        req.setCorreoDueno("nuevo@test.com");

        when(preferenciaUsuarioRepository.findByCorreoUsuario("nuevo@test.com")).thenReturn(Optional.empty());

        notificacionService.procesarCoincidencia(req);

        // Por defecto, ambas preferencias son true, así que debería enviar el correo
        verify(notificacionRepository, times(1)).save(any(NotificacionModel.class));
        verify(emailService, times(1)).sendEmail(eq("nuevo@test.com"), anyString(), anyString());
    }

    @Test
    void procesarAprobacionClinica_GuardaNotificacionYEnviaCorreo() {
        ClinicaAprobadaRequest req = new ClinicaAprobadaRequest();
        req.setCorreoClinica("clinica@vet.com");
        req.setNombreClinica("Vet Feliz");

        notificacionService.procesarAprobacionClinica(req);

        verify(notificacionRepository, times(1)).save(any(NotificacionModel.class));
        verify(emailService, times(1)).sendEmail(eq("clinica@vet.com"), eq("¡Cuenta de Clínica Activa!"), contains("Vet Feliz"));
    }

    @Test
    void obtenerHistorial_RetornaListaDelRepositorio() {
        NotificacionModel notif1 = new NotificacionModel();
        notif1.setTitulo("Notif 1");
        NotificacionModel notif2 = new NotificacionModel();
        notif2.setTitulo("Notif 2");

        when(notificacionRepository.findByCorreoUsuarioOrderByFechaCreacionDesc("test@test.com"))
                .thenReturn(Arrays.asList(notif1, notif2));

        List<NotificacionModel> resultado = notificacionService.obtenerHistorial("test@test.com");

        assertEquals(2, resultado.size());
        assertEquals("Notif 1", resultado.get(0).getTitulo());
        verify(notificacionRepository, times(1)).findByCorreoUsuarioOrderByFechaCreacionDesc("test@test.com");
    }
}
