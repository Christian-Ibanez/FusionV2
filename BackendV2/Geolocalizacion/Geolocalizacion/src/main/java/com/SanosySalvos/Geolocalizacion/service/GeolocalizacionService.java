package com.SanosySalvos.Geolocalizacion.service;

import com.SanosySalvos.Geolocalizacion.model.Reporte;
import com.SanosySalvos.Geolocalizacion.repository.ReporteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class GeolocalizacionService {

    @Autowired
    private ReporteRepository reporteRepository;

    // HU-1: Radio de búsqueda (5km)
    public List<Reporte> obtenerReportesCercanos(Double lat, Double lng) {
        return reporteRepository.findActivosCercanos(lat, lng, 5.0);
    }

    // HU-2: Mapa de calor (filtro temporal)
    public List<Reporte> obtenerReportesPorFechas(LocalDateTime inicio, LocalDateTime fin) {
        return reporteRepository.findByFechaCreacionBetween(inicio, fin);
    }

    // HU-3: Coincidencia geográfica (2km)
    public List<Reporte> buscarCoincidenciasGeograficas(Long idReportePerdida) {
        Optional<Reporte> reporteOpt = reporteRepository.findById(idReportePerdida);
        
        if (reporteOpt.isEmpty() || !reporteOpt.get().getTipo().equalsIgnoreCase("PERDIDA")) {
            throw new IllegalArgumentException("Reporte de pérdida no encontrado o tipo inválido.");
        }

        Reporte perdida = reporteOpt.get();
        // Buscamos todos los HALLAZGOS a 2km a la redonda
        return reporteRepository.findCercanosPorTipo(perdida.getLatitud(), perdida.getLongitud(), 2.0, "HALLAZGO");
    }

    public Reporte guardarReporte(Reporte reporte) {
        if (reporte.getUbicacion() == null && reporte.getLatitud() != null && reporte.getLongitud() != null) {
            Reporte factoryReporte = com.SanosySalvos.Geolocalizacion.model.ReporteFactory.crearReporte(
                    reporte.getTipo() != null ? reporte.getTipo() : "PERDIDA", 
                    reporte.getLatitud(), 
                    reporte.getLongitud()
            );
            reporte.setUbicacion(factoryReporte.getUbicacion());
        }
        if (reporte.getFechaCreacion() == null) {
            reporte.setFechaCreacion(LocalDateTime.now());
        }
        if (reporte.getEstado() == null) {
            reporte.setEstado("ACTIVO");
        }
        return reporteRepository.save(reporte);
    }
}
