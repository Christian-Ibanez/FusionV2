package com.SanosySalvos.Reportes.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.ColumnTransformer;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "reportes")
@Data
@Getter
@Setter

public class Reporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId; 

    
    @Column(name = "mascota_id")
    private Long mascotaId; 

    @Column(nullable = false, length = 100)
    private String titulo;

    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_reporte", nullable = false)
    private TipoReporte tipoReporte; 

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoReporte estado; 

    // Volver a poner @Column(nullable = false) cuando tengamos el frontend
    private Double latitud;
    private Double longitud;

    
    @Column(name = "fecha_incidente", nullable = false)
    private LocalDateTime fechaIncidente; 

    
    @Column(columnDefinition = "TEXT")
    private String urlImagen; 

    @Column(columnDefinition = "TEXT")
    private String descripcion; 
    
    @Column(name = "vector_imagen", columnDefinition = "vector(512)", length = 20000) // Using 512 as an example dimension
    @ColumnTransformer(write="?::vector")
    private String vectorImagen;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = EstadoReporte.ACTIVO; 
        }
    }
}
