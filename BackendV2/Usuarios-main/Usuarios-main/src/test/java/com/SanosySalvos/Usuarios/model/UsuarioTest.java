package com.SanosySalvos.Usuarios.model;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class UsuarioTest {
    @Test
    public void testGettersAndSetters() {
        Usuario u = new Usuario();
        u.setId(1L);
        u.setNombreCompleto("Test");
        u.setCorreoElectronico("test@test.com");
        u.setContrasena("123");
        u.setRol(RolUsuario.CIUDADANO);
        u.setCuentaValidada(true);
        u.setUrlDocumentoValidacion("url");
        u.setTelefono("123");

        assertEquals(1L, u.getId());
        assertEquals("Test", u.getNombreCompleto());
        assertEquals("test@test.com", u.getCorreoElectronico());
        assertEquals("123", u.getContrasena());
        assertEquals(RolUsuario.CIUDADANO, u.getRol());
        assertTrue(u.getCuentaValidada());
        assertEquals("url", u.getUrlDocumentoValidacion());
        assertEquals("123", u.getTelefono());
    }
}
