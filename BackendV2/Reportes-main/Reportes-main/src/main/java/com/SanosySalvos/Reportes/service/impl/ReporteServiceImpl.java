package com.SanosySalvos.Reportes.service.impl;

import com.SanosySalvos.Reportes.dto.AnalisisRequestDTO;
import com.SanosySalvos.Reportes.dto.ReporteCruzeDTO;
import com.SanosySalvos.Reportes.dto.ReporteRequestDTO;
import com.SanosySalvos.Reportes.dto.ReporteResponseDTO;
import com.SanosySalvos.Reportes.model.EstadoReporte;
import com.SanosySalvos.Reportes.model.Reporte;
import com.SanosySalvos.Reportes.model.TipoReporte;
import com.SanosySalvos.Reportes.repository.ReporteRepository;
import com.SanosySalvos.Reportes.service.CoincidenciaClient;
import com.SanosySalvos.Reportes.service.ReporteService;
import com.SanosySalvos.Reportes.service.UsuarioClient;
import com.SanosySalvos.Reportes.service.NotificacionClient;
import com.SanosySalvos.Reportes.dto.NotificacionRequestDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReporteServiceImpl implements ReporteService {

    @Autowired
    private ReporteRepository reporteRepository;

    @Autowired
    private UsuarioClient usuarioClient;

    @Autowired
    private CoincidenciaClient coincidenciaClient;

    @Autowired
    private NotificacionClient notificacionClient;
    
    @Override
    public ReporteResponseDTO crearReporte(ReporteRequestDTO requestDTO) {
        if (requestDTO.getUsuarioId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El ID del usuario es obligatorio para crear un reporte.");
        }

        boolean usuarioValido = usuarioClient.verificarUsuarioExterno(requestDTO.getUsuarioId());
        if (!usuarioValido) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El usuario indicado no existe en el sistema.");
        }

        Reporte reporte = new Reporte();
        reporte.setUsuarioId(requestDTO.getUsuarioId());
        reporte.setMascotaId(requestDTO.getMascotaId());
        reporte.setTipoReporte(requestDTO.getTipoReporte());
        reporte.setTitulo(requestDTO.getTitulo());
        reporte.setDescripcion(requestDTO.getDescripcion());
        reporte.setUrlImagen(requestDTO.getUrlImagen());
        reporte.setFechaIncidente(requestDTO.getFechaIncidente());
        reporte.setLatitud(requestDTO.getLatitud());
        reporte.setLongitud(requestDTO.getLongitud());
        
        Reporte reporteGuardado = reporteRepository.save(reporte);

        // Usamos reporteGuardado, que es la variable que sí existe en tu código
        ReporteCruzeDTO nuevoDTO = new ReporteCruzeDTO();
        nuevoDTO.setId(reporteGuardado.getId());
        nuevoDTO.setTipoReporte(reporteGuardado.getTipoReporte().name());
        nuevoDTO.setLatitud(reporteGuardado.getLatitud());
        nuevoDTO.setLongitud(reporteGuardado.getLongitud());
        nuevoDTO.setUrlImagen(reporteGuardado.getUrlImagen());
        
        String correoNuevo = usuarioClient.obtenerCorreoUsuario(reporteGuardado.getUsuarioId());
        nuevoDTO.setCorreoUsuario(correoNuevo);

        TipoReporte tipoBuscado = reporteGuardado.getTipoReporte() == TipoReporte.PERDIDO ? TipoReporte.ENCONTRADO : TipoReporte.PERDIDO;
    
        List<ReporteCruzeDTO> candidatosDTO = reporteRepository.findByTipoReporte(tipoBuscado).stream().map(rep -> {
            ReporteCruzeDTO dto = new ReporteCruzeDTO();
            dto.setId(rep.getId());
            dto.setTipoReporte(rep.getTipoReporte().name());
            dto.setLatitud(rep.getLatitud());
            dto.setLongitud(rep.getLongitud());
            dto.setUrlImagen(rep.getUrlImagen());
            String correoCand = usuarioClient.obtenerCorreoUsuario(rep.getUsuarioId());
            dto.setCorreoUsuario(correoCand);
            return dto;
        }).toList();

        AnalisisRequestDTO requestAnalisis = new AnalisisRequestDTO();
            requestAnalisis.setReporteNuevo(nuevoDTO);
            requestAnalisis.setCandidatos(candidatosDTO);

            coincidenciaClient.enviarParaAnalisis(requestAnalisis);

            // Enviar notificación de creación de reporte
            NotificacionRequestDTO notificacionDTO = new NotificacionRequestDTO();
            notificacionDTO.setUsuarioId(reporteGuardado.getUsuarioId());
            notificacionDTO.setMensaje("Se ha creado exitosamente el reporte: " + reporteGuardado.getTitulo());
            notificacionClient.enviarNotificacion(notificacionDTO);

            return mapearAResponseDTO(reporteGuardado);
    }

    @Override
    public List<ReporteResponseDTO> obtenerReportesActivos() {
            
        List<Reporte> reportes = reporteRepository.findByEstado(EstadoReporte.ACTIVO);
            
        return reportes.stream()
            .map(this::mapearAResponseDTO)
            .collect(Collectors.toList());
    }

    @Override
    public ReporteResponseDTO marcarComoResuelto(Long reporteId, Long usuarioId) {
        Reporte reporte = reporteRepository.findById(reporteId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "El reporte no existe."));

        if (!reporte.getUsuarioId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado: Solo el creador del reporte puede cerrarlo.");
        }

        reporte.setEstado(EstadoReporte.RESUELTO);
        Reporte reporteActualizado = reporteRepository.save(reporte);

        return mapearAResponseDTO(reporteActualizado);
    }

    @Override
    public List<ReporteResponseDTO> obtenerTodosLosReportes() {
        List<Reporte> reportes = reporteRepository.findAll();
        return reportes.stream()
            .map(this::mapearAResponseDTO)
            .collect(Collectors.toList());
    }
    
    private ReporteResponseDTO mapearAResponseDTO(Reporte reporte) {
        ReporteResponseDTO dto = new ReporteResponseDTO();
        dto.setId(reporte.getId());
        dto.setUsuarioId(reporte.getUsuarioId());
        dto.setMascotaId(reporte.getMascotaId());
        dto.setTipoReporte(reporte.getTipoReporte());
        dto.setEstado(reporte.getEstado());
        dto.setTitulo(reporte.getTitulo());
        dto.setDescripcion(reporte.getDescripcion());
        dto.setUrlImagen(reporte.getUrlImagen());
        dto.setLatitud(reporte.getLatitud());
        dto.setLongitud(reporte.getLongitud());
        dto.setFechaIncidente(reporte.getFechaIncidente());
        dto.setFechaCreacion(reporte.getFechaCreacion());
        return dto;
    }
}