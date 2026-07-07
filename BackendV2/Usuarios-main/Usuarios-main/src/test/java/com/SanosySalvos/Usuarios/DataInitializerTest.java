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
public class DataInitializerTest {
    @Mock
    private UsuarioRepository repository;
    @InjectMocks
    private DataInitializer initializer;

    @Test
    public void testRun_AdminExists() throws Exception {
        when(repository.existsByCorreoElectronico(anyString())).thenReturn(true);
        initializer.run();
        verify(repository, never()).save(any(Usuario.class));
    }

    @Test
    public void testRun_AdminNotExists() throws Exception {
        when(repository.existsByCorreoElectronico(anyString())).thenReturn(false);
        initializer.run();
        verify(repository, times(1)).save(any(Usuario.class));
    }
}
