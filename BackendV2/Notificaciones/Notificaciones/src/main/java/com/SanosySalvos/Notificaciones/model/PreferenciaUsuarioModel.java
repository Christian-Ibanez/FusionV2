package com.SanosySalvos.Notificaciones.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "preferencias_usuario")
@Getter
@Setter
public class PreferenciaUsuarioModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String correoUsuario;

    @Column(nullable = false)
    private boolean recibirCorreos = true;

    @Column(nullable = false)
    private boolean recibirPush = true;
}
