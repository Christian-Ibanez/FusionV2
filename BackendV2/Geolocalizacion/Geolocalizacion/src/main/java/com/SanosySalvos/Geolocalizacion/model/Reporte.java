package com.SanosySalvos.Geolocalizacion.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reportes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // "PERDIDA" o "HALLAZGO"
    @Column(nullable = false)
    private String tipo;

    // "ACTIVO" o "INACTIVO"
    @Column(nullable = false)
    private String estado;

    @Column(nullable = false)
    private Double latitud;

    @Column(nullable = false)
    private Double longitud;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(columnDefinition = "geometry(Point,4326)")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private org.locationtech.jts.geom.Point ubicacion;

    public Reporte(Long id, String tipo, String estado, Double latitud, Double longitud, LocalDateTime fechaCreacion) {
        this.id = id;
        this.tipo = tipo;
        this.estado = estado;
        this.latitud = latitud;
        this.longitud = longitud;
        this.fechaCreacion = fechaCreacion;
    }

}
