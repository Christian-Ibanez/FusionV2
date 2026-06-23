package com.SanosySalvos.Reportes.dto;

import lombok.Data;

@Data
public class NotificacionRequestDTO {
    private Long usuarioId;
    private String mensaje;
}
