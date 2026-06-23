package com.SanosySalvos.Notificaciones.service;

import com.SanosySalvos.Notificaciones.dto.ClinicaAprobadaRequest;
import com.SanosySalvos.Notificaciones.dto.NotificacionRequest;
import com.SanosySalvos.Notificaciones.model.NotificacionModel;
import com.SanosySalvos.Notificaciones.model.PreferenciaUsuarioModel;
import com.SanosySalvos.Notificaciones.repository.NotificacionRepository;
import com.SanosySalvos.Notificaciones.repository.PreferenciaUsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificacionService {

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private PreferenciaUsuarioRepository preferenciaUsuarioRepository;

    @Autowired
    private EmailService emailService;

    public void procesarCoincidencia(NotificacionRequest request) {
        String correo = request.getCorreoDueno();
        String titulo = "¡Posible coincidencia encontrada!";
        String mensaje = "Hemos detectado una mascota parecida a la que reportaste como perdida. Por favor revisa la plataforma para más detalles.";

        // Guardar la notificacion en el historial (siempre)
        NotificacionModel notificacion = new NotificacionModel();
        notificacion.setCorreoUsuario(correo);
        notificacion.setTitulo(titulo);
        notificacion.setMensaje(mensaje);
        notificacionRepository.save(notificacion);

        // Revisar preferencias del usuario
        PreferenciaUsuarioModel preferencias = preferenciaUsuarioRepository.findByCorreoUsuario(correo)
                .orElse(new PreferenciaUsuarioModel()); // Por defecto todo activo

        if (preferencias.isRecibirCorreos()) {
            emailService.sendEmail(correo, titulo, mensaje);
        }
        
        if (preferencias.isRecibirPush()) {
            // Simulación de push notification
            System.out.println("Enviando Push Notification a: " + correo + " - " + titulo);
        }
    }

    public void procesarAprobacionClinica(ClinicaAprobadaRequest request) {
        String correo = request.getCorreoClinica();
        String titulo = "¡Cuenta de Clínica Activa!";
        String mensaje = "Hola " + request.getNombreClinica() + ", tus documentos han sido aprobados. Tu cuenta ya está Activa y puedes empezar a usar la plataforma.";

        // Guardar la notificacion
        NotificacionModel notificacion = new NotificacionModel();
        notificacion.setCorreoUsuario(correo);
        notificacion.setTitulo(titulo);
        notificacion.setMensaje(mensaje);
        notificacionRepository.save(notificacion);

        // En este caso siempre enviamos correo oficial
        emailService.sendEmail(correo, titulo, mensaje);
    }

    public List<NotificacionModel> obtenerHistorial(String correo) {
        return notificacionRepository.findByCorreoUsuarioOrderByFechaCreacionDesc(correo);
    }
}
