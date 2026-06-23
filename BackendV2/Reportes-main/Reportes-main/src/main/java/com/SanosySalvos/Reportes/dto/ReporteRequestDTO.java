package com.SanosySalvos.Reportes.dto;

import com.SanosySalvos.Reportes.model.TipoReporte;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReporteRequestDTO {

    private Long usuarioId;
    private Long mascotaId;

    private TipoReporte tipoReporte;

    private String titulo;
    private String descripcion;
    private String urlImagen;

    private LocalDateTime fechaIncidente;
    
    private Double latitud;
    private Double longitud;
}