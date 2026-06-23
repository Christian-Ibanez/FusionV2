package com.SanosySalvos.Notificaciones.controller;

import com.SanosySalvos.Notificaciones.dto.ClinicaAprobadaRequest;
import com.SanosySalvos.Notificaciones.dto.NotificacionRequest;
import com.SanosySalvos.Notificaciones.dto.NotificacionSimpleRequestDTO;
import com.SanosySalvos.Notificaciones.model.NotificacionModel;
import com.SanosySalvos.Notificaciones.repository.NotificacionRepository;
import com.SanosySalvos.Notificaciones.service.NotificacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private NotificacionRepository notificacionRepository;

    @PostMapping("/coincidencia")
    public ResponseEntity<String> procesarCoincidencia(@RequestBody NotificacionRequest request) {
        notificacionService.procesarCoincidencia(request);
        return ResponseEntity.ok("Alerta procesada y notificaciones enviadas si corresponde.");
    }

    @PostMapping("/enviar")
    public ResponseEntity<String> recibirNotificacion(@RequestBody NotificacionSimpleRequestDTO request) {
        System.out.println("🔔 [Notificaciones] Alerta recibida para usuario ID: " + request.getUsuarioId());
        System.out.println("🔔 Mensaje: " + request.getMensaje());
        
        NotificacionModel notificacion = new NotificacionModel();
        notificacion.setCorreoUsuario(String.valueOf(request.getUsuarioId()));
        notificacion.setTitulo("Nueva actualización de Reporte");
        notificacion.setMensaje(request.getMensaje());
        notificacionRepository.save(notificacion);
        
        return ResponseEntity.ok("Notificación simple procesada correctamente.");
    }

    @PostMapping("/clinica/aprobada")
    public ResponseEntity<String> procesarAprobacionClinica(@RequestBody ClinicaAprobadaRequest request) {
        notificacionService.procesarAprobacionClinica(request);
        return ResponseEntity.ok("Notificación de aprobación enviada a la clínica.");
    }

    @GetMapping("/{correo}")
    public ResponseEntity<List<NotificacionModel>> obtenerHistorial(@PathVariable String correo) {
        return ResponseEntity.ok(notificacionService.obtenerHistorial(correo));
    }
}
