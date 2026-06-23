package com.SanosySalvos.Notificaciones.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PreferenciaRequest {
    private boolean recibirCorreos;
    private boolean recibirPush;
}
