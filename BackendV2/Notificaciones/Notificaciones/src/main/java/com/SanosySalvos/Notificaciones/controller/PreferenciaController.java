package com.SanosySalvos.Notificaciones.controller;

import com.SanosySalvos.Notificaciones.dto.PreferenciaRequest;
import com.SanosySalvos.Notificaciones.model.PreferenciaUsuarioModel;
import com.SanosySalvos.Notificaciones.repository.PreferenciaUsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferencias")
public class PreferenciaController {

    @Autowired
    private PreferenciaUsuarioRepository preferenciaRepository;

    @PutMapping("/{correo}")
    public ResponseEntity<String> actualizarPreferencias(@PathVariable String correo, @RequestBody PreferenciaRequest request) {
        PreferenciaUsuarioModel pref = preferenciaRepository.findByCorreoUsuario(correo)
                .orElse(new PreferenciaUsuarioModel());
        
        pref.setCorreoUsuario(correo);
        pref.setRecibirCorreos(request.isRecibirCorreos());
        pref.setRecibirPush(request.isRecibirPush());
        
        preferenciaRepository.save(pref);
        
        return ResponseEntity.ok("Preferencias actualizadas.");
    }
    
    @GetMapping("/{correo}")
    public ResponseEntity<PreferenciaUsuarioModel> obtenerPreferencias(@PathVariable String correo) {
        PreferenciaUsuarioModel pref = preferenciaRepository.findByCorreoUsuario(correo)
                .orElse(new PreferenciaUsuarioModel());
        pref.setCorreoUsuario(correo);
        return ResponseEntity.ok(pref);
    }
}
