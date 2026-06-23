package com.SanosySalvos.IdentificacioAcceso.dto;

import com.SanosySalvos.IdentificacioAcceso.model.RolModel;

public class RegistroRequest {
    private String correo;
    private String contrasena;
    private RolModel rol;
    private String nombre;
    private String telefono;
    private String nombreInstitucion;
    private String urlLogoInstitucion;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
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
