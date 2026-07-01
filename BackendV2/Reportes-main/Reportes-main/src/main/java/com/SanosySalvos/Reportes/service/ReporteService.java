package com.SanosySalvos.Reportes.service;

import com.SanosySalvos.Reportes.dto.ReporteRequestDTO;
import com.SanosySalvos.Reportes.dto.ReporteResponseDTO;
import java.util.List;

public interface ReporteService {
    
    ReporteResponseDTO crearReporte(ReporteRequestDTO requestDTO);
    
    List<ReporteResponseDTO> obtenerReportesActivos();

    ReporteResponseDTO marcarComoResuelto(Long reporteId, Long usuarioId, Long idReporteMatch);

    List<ReporteResponseDTO> obtenerTodosLosReportes();
}