package com.SanosySalvos.Notificaciones.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NotificacionRequest {
    private String correoDueno;
    private Long idMascotaPerdida;
    private Long idMascotaEncontrada;
}
