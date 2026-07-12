package com.SanosySalvos.IdentificacioAcceso.model;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
@lombok.Generated
public class UsuarioModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String correo;

    @Column(nullable = false)
    private String contrasena;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolModel rol;

    @Column(name = "nombre_institucion")
    private String nombreInstitucion;

    @Column(name = "url_logo_institucion")
    private String urlLogoInstitucion;

    public UsuarioModel() {
    }

    public UsuarioModel(String correo, String contrasena, RolModel rol, String nombreInstitucion, String urlLogoInstitucion) {
        this.correo = correo;
        this.contrasena = contrasena;
        this.rol = rol;
        this.nombreInstitucion = nombreInstitucion;
        this.urlLogoInstitucion = urlLogoInstitucion;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    public RolModel getRol() {
        return rol;
    }

    public void setRol(RolModel rol) {
        this.rol = rol;
    }

    public String getNombreInstitucion() {
        return nombreInstitucion;
    }

    public void setNombreInstitucion(String nombreInstitucion) {
        this.nombreInstitucion = nombreInstitucion;
    }

    public String getUrlLogoInstitucion() {
        return urlLogoInstitucion;
    }

    public void setUrlLogoInstitucion(String urlLogoInstitucion) {
        this.urlLogoInstitucion = urlLogoInstitucion;
    }
}
