package com.SanosySalvos.Geolocalizacion.controller;

import com.SanosySalvos.Geolocalizacion.model.Reporte;
import com.SanosySalvos.Geolocalizacion.service.GeolocalizacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/geolocalizacion")
public class GeolocalizacionController {

    @Autowired
    private GeolocalizacionService geolocalizacionService;

    @GetMapping("/cercanos")
    public ResponseEntity<List<Reporte>> obtenerReportesCercanos(
            @RequestParam Double lat,
            @RequestParam Double lng) {
        
        List<Reporte> reportes = geolocalizacionService.obtenerReportesCercanos(lat, lng);
        return ResponseEntity.ok(reportes);
    }

    @GetMapping("/incidencias")
    public ResponseEntity<List<Reporte>> obtenerMapaCalorPorFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        
        List<Reporte> reportes = geolocalizacionService.obtenerReportesPorFechas(fechaInicio, fechaFin);
        return ResponseEntity.ok(reportes);
    }

    @GetMapping("/coincidencias/{idReportePerdida}")
    public ResponseEntity<List<Reporte>> buscarCoincidencias(@PathVariable Long idReportePerdida) {
        try {
            List<Reporte> coincidencias = geolocalizacionService.buscarCoincidenciasGeograficas(idReportePerdida);
            return ResponseEntity.ok(coincidencias);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/reportes")
    public ResponseEntity<Reporte> crearReporte(@RequestBody Reporte reporte) {
        Reporte guardado = geolocalizacionService.guardarReporte(reporte);
        return ResponseEntity.ok(guardado);
    }
}
