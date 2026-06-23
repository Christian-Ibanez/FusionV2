package com.SanosySalvos.Reportes.dto;

import lombok.Data;

@Data
public class ReporteCruzeDTO {
    private Long id;
    private String tipoReporte;
    private Double latitud;
    private Double longitud;
}