package com.SanosySalvos.Mascotas.controller;

import com.SanosySalvos.Mascotas.model.MascotaModel;
import com.SanosySalvos.Mascotas.service.MascotaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mascotas")
public class MascotaController {

    private final MascotaService mascotaService;

    public MascotaController(MascotaService mascotaService) {
        this.mascotaService = mascotaService;
    }

    @GetMapping("/listar")
    public List<MascotaModel> getAllMascotas() {
        return mascotaService.findAll();
    }

    @GetMapping("/obtener/{id}")
    public ResponseEntity<MascotaModel> getMascotaById(@PathVariable Long id) {
        return mascotaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/crear")
    public ResponseEntity<MascotaModel> createMascota(@RequestBody MascotaModel mascota) {
        MascotaModel saved = mascotaService.save(mascota);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/modificar/{id}")
    public ResponseEntity<MascotaModel> updateMascota(@PathVariable Long id, @RequestBody MascotaModel mascota) {
        if (mascotaService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        MascotaModel updated = mascotaService.update(id, mascota);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> deleteMascota(@PathVariable Long id) {
        if (mascotaService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        mascotaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
