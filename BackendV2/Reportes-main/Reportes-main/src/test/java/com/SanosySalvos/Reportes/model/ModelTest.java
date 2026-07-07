package com.SanosySalvos.Reportes.model;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class ModelTest {
    @Test
    public void testReporte() {
        Reporte r = new Reporte();
        r.setId(1L);
        r.setUsuarioId(1L);
        r.setMascotaId(1L);
        r.setTitulo("Test");
        r.setTipoReporte(TipoReporte.PERDIDO);
        r.setEstado(EstadoReporte.ACTIVO);
        r.setLatitud(-33.0);
        r.setLongitud(-70.0);
        r.setFechaIncidente(java.time.LocalDateTime.now());
        r.setUrlImagen("http");
        r.setDescripcion("Desc");
        r.setVectorImagen("[0.1]");
        r.onCreate();
        
        assertEquals(1L, r.getId());
        assertEquals(1L, r.getUsuarioId());
        assertEquals(1L, r.getMascotaId());
        assertEquals("Test", r.getTitulo());
        assertEquals(TipoReporte.PERDIDO, r.getTipoReporte());
        assertEquals(EstadoReporte.ACTIVO, r.getEstado());
        assertEquals(-33.0, r.getLatitud());
        assertEquals(-70.0, r.getLongitud());
        assertNotNull(r.getFechaIncidente());
        assertEquals("http", r.getUrlImagen());
        assertEquals("Desc", r.getDescripcion());
        assertEquals("[0.1]", r.getVectorImagen());
        assertNotNull(r.getFechaCreacion());
    }

    @Test
    public void testEnums() {
        assertNotNull(TipoReporte.valueOf("PERDIDO"));
        assertNotNull(EstadoReporte.valueOf("ACTIVO"));
    }
}
