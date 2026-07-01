package com.SanosySalvos.Reportes.controller;

import com.SanosySalvos.Reportes.dto.ReporteRequestDTO;
import com.SanosySalvos.Reportes.dto.ReporteResponseDTO;
import com.SanosySalvos.Reportes.service.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    @Autowired
    private ReporteService reporteService;

    @PostMapping("/crearReporte")
    public ResponseEntity<ReporteResponseDTO> crearReporte(@RequestBody ReporteRequestDTO requestDTO) {
        ReporteResponseDTO nuevoReporte = reporteService.crearReporte(requestDTO);
        return new ResponseEntity<>(nuevoReporte, HttpStatus.CREATED);
    }

    @GetMapping("/activos")
    public ResponseEntity<List<ReporteResponseDTO>> obtenerReportesActivos() {
        List<ReporteResponseDTO> reportes = reporteService.obtenerReportesActivos();
        return ResponseEntity.ok(reportes);
    }

    @PutMapping("/{id}/resolver")
    public ResponseEntity<ReporteResponseDTO> marcarComoResuelto(
            @PathVariable("id") Long reporteId,
            @RequestParam("usuarioId") Long usuarioId,
            @RequestParam(value = "idReporteMatch", required = false) Long idReporteMatch) {
        
        ReporteResponseDTO reporteActualizado = reporteService.marcarComoResuelto(reporteId, usuarioId, idReporteMatch);
        return ResponseEntity.ok(reporteActualizado);
    }

    @GetMapping("/todos")
    public ResponseEntity<List<ReporteResponseDTO>> obtenerTodosLosReportes() {
        List<ReporteResponseDTO> reportes = reporteService.obtenerTodosLosReportes();
        return ResponseEntity.ok(reportes);
    }
}