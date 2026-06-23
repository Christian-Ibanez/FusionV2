package com.SanosySalvos.Reportes.dto;

import com.SanosySalvos.Reportes.model.EstadoReporte;
import com.SanosySalvos.Reportes.model.TipoReporte;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReporteResponseDTO {

    private Long id; 

    private Long usuarioId;
    private Long mascotaId;
    
    private TipoReporte tipoReporte;
    private EstadoReporte estado; 
    private String titulo;
    private String descripcion;
    private String urlImagen;
    
    private Double latitud;
    private Double longitud;
    
    private LocalDateTime fechaIncidente;
    private LocalDateTime fechaCreacion; 
}