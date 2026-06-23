package com.SanosySalvos.Geolocalizacion.model;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

import java.time.LocalDateTime;

public class ReporteFactory {

    private static final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    public static Reporte crearReporte(String tipo, Double latitud, Double longitud) {
        Reporte reporte = new Reporte();
        reporte.setTipo(tipo.toUpperCase());
        reporte.setEstado("ACTIVO");
        reporte.setFechaCreacion(LocalDateTime.now());
        
        // Mantener las coordenadas planas por retrocompatibilidad con JSON
        reporte.setLatitud(latitud);
        reporte.setLongitud(longitud);
        
        // Crear el Point de JTS para PostGIS (Longitud va primero en X, Latitud en Y)
        Point ubicacion = geometryFactory.createPoint(new Coordinate(longitud, latitud));
        reporte.setUbicacion(ubicacion);
        
        return reporte;
    }

    public static Reporte crearPerdida(Double latitud, Double longitud) {
        return crearReporte("PERDIDA", latitud, longitud);
    }

    public static Reporte crearHallazgo(Double latitud, Double longitud) {
        return crearReporte("HALLAZGO", latitud, longitud);
    }
}
