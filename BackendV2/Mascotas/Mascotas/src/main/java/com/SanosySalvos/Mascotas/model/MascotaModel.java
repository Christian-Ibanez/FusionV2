package com.SanosySalvos.Mascotas.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
@lombok.Generated
public class MascotaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String raza;
    private String color;
    private int edad;
    private String imagenUrl;

    public MascotaModel() {
    }

    public MascotaModel(Long id, String nombre, String raza, String color, int edad, String imagenUrl) {
        this.id = id;
        this.nombre = nombre;
        this.raza = raza;
        this.color = color;
        this.edad = edad;
        this.imagenUrl = imagenUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    public String getRaza() {
        return raza;
    }

    public void setRaza(String raza) {
        this.raza = raza;
    }
    public String getColor() {
        return color;
        }

    public void setColor(String color) {
        this.color = color;
    }
    public int getEdad() {
        return edad;
    }

    public void setEdad(int edad) {
        this.edad = edad;
    }
    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }
    @Override
    public String toString() {
        return "Ingresar Datos: " +
                "nombre= " + nombre + '\'' +
                "raza= " + raza + '\'' +
                "color= " + color + '\'' +
                "edad= " + edad + '\'' +
                "imagenUrl= " + imagenUrl + '\'';
    }
}
