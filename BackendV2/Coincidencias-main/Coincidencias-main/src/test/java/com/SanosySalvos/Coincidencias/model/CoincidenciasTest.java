package com.SanosySalvos.Coincidencias.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;

class CoincidenciasTest {

    @Test
    void testOnCreate_SetsFechaAndEstado() {
        Coincidencias coincidencia = new Coincidencias();
        coincidencia.onCreate();
        
        assertNotNull(coincidencia.getFechaCalculo());
        assertEquals(EstadoCoincidencia.PENDIENTE, coincidencia.getEstado());
    }
    
    @Test
    void testOnCreate_DoesNotOverrideEstado() {
        Coincidencias coincidencia = new Coincidencias();
        coincidencia.setEstado(EstadoCoincidencia.DESCARTADO);
        coincidencia.onCreate();
        
        assertNotNull(coincidencia.getFechaCalculo());
        assertEquals(EstadoCoincidencia.DESCARTADO, coincidencia.getEstado());
    }
}
