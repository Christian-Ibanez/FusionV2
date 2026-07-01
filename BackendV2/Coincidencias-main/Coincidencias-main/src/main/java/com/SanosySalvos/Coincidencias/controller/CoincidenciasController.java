package com.SanosySalvos.Coincidencias.controller;

import com.SanosySalvos.Coincidencias.dto.AnalisisRequestDTO;
import com.SanosySalvos.Coincidencias.model.Coincidencias;
import com.SanosySalvos.Coincidencias.service.CoincidenciasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coincidencias")
@CrossOrigin(origins = "*")
public class CoincidenciasController {

    @Autowired
    private CoincidenciasService coincidenciasService;

    @PostMapping("/analizar")
    public ResponseEntity<String> analizarMatch(@RequestBody AnalisisRequestDTO request) {
        coincidenciasService.procesarNuevasCoincidencias(request.getReporteNuevo(), request.getCandidatos());
        return ResponseEntity.ok("Análisis procesado con éxito.");
    }

    @PutMapping("/{id}/descartar")
    public ResponseEntity<Coincidencias> descartarCoincidencia(@PathVariable("id") Long id) {
        Coincidencias coincidenciaDescartada = coincidenciasService.descartarCoincidencia(id);
        return ResponseEntity.ok(coincidenciaDescartada);
    }

    @GetMapping("/reporte/{reporteId}")
    public ResponseEntity<java.util.List<Coincidencias>> obtenerPorReporte(@PathVariable("reporteId") Long reporteId) {
        java.util.List<Coincidencias> coincidencias = coincidenciasService.obtenerPorReporte(reporteId);
        return ResponseEntity.ok(coincidencias);
    }
}