package com.SanosySalvos.Notificaciones.dto;

import lombok.Data;

@Data
public class NotificacionSimpleRequestDTO {
    private Long usuarioId;
    private String mensaje;
}
