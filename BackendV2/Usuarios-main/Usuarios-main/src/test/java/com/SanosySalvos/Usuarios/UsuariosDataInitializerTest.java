package com.SanosySalvos.Usuarios;

import com.SanosySalvos.Usuarios.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.SanosySalvos.Usuarios.model.Usuario;
import java.util.Optional;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UsuariosDataInitializerTest {
    @Mock
    private UsuarioRepository repository;
    @InjectMocks
    private UsuariosDataInitializer initializer;

    @Test
    public void testRun_AdminExists() throws Exception {
        when(repository.findByCorreoElectronico(anyString())).thenReturn(Optional.of(new Usuario()));
        initializer.run();
        verify(repository, never()).save(any(Usuario.class));
    }

    @Test
    public void testRun_AdminNotExists() throws Exception {
        when(repository.findByCorreoElectronico(anyString())).thenReturn(Optional.empty());
        initializer.run();
        verify(repository, times(1)).save(any(Usuario.class));
    }
}
