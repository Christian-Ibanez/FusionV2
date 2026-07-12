package com.SanosySalvos.Geolocalizacion.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ReporteFactoryTest {

    @Test
    void testCrearReporte() {
        Reporte reporte = ReporteFactory.crearReporte("OTRO", 10.0, 20.0);
        assertEquals("OTRO", reporte.getTipo());
        assertEquals("ACTIVO", reporte.getEstado());
        assertNotNull(reporte.getFechaCreacion());
        assertEquals(10.0, reporte.getLatitud());
        assertEquals(20.0, reporte.getLongitud());
        assertNotNull(reporte.getUbicacion());
        assertEquals(20.0, reporte.getUbicacion().getX());
        assertEquals(10.0, reporte.getUbicacion().getY());
        
        // Also test the instantiation of the factory
        assertNotNull(new ReporteFactory());
    }

    @Test
    void testCrearPerdida() {
        Reporte perdida = ReporteFactory.crearPerdida(15.0, 25.0);
        assertEquals("PERDIDA", perdida.getTipo());
        assertEquals(15.0, perdida.getLatitud());
        assertEquals(25.0, perdida.getLongitud());
    }

    @Test
    void testCrearHallazgo() {
        Reporte hallazgo = ReporteFactory.crearHallazgo(15.0, 25.0);
        assertEquals("HALLAZGO", hallazgo.getTipo());
        assertEquals(15.0, hallazgo.getLatitud());
        assertEquals(25.0, hallazgo.getLongitud());
    }
}
