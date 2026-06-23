package com.SanosySalvos.IdentificacioAcceso.service;

import com.SanosySalvos.IdentificacioAcceso.dto.LoginRequest;
import com.SanosySalvos.IdentificacioAcceso.dto.RegistroRequest;
import com.SanosySalvos.IdentificacioAcceso.model.RolModel;
import com.SanosySalvos.IdentificacioAcceso.model.UsuarioModel;
import com.SanosySalvos.IdentificacioAcceso.repository.UsuarioRepository;
import com.SanosySalvos.IdentificacioAcceso.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AutenticacionServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AutenticacionService autenticacionService;

    private RegistroRequest registroRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        registroRequest = new RegistroRequest();
        registroRequest.setCorreo("test@test.com");
        registroRequest.setContrasena("123456");
        registroRequest.setRol(RolModel.USUARIO);

        loginRequest = new LoginRequest();
        loginRequest.setCorreo("test@test.com");
        loginRequest.setContrasena("123456");
    }

    @Test
    void registrarUsuario_LanzaExcepcion_SiCorreoYaExiste() {
        // Arrange
        when(usuarioRepository.findByCorreo("test@test.com")).thenReturn(Optional.of(new UsuarioModel()));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            autenticacionService.registrarUsuario(registroRequest);
        });

        assertEquals("Este correo ya está en uso. ¿Deseas iniciar sesión?", exception.getMessage());
        verify(usuarioRepository, never()).save(any(UsuarioModel.class));
    }

    @Test
    void registrarUsuario_GuardaUsuario_SiCorreoNoExiste() {
        // Arrange
        when(usuarioRepository.findByCorreo("test@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("123456")).thenReturn("encodedPassword");

        // Act
        autenticacionService.registrarUsuario(registroRequest);

        // Assert
        verify(usuarioRepository, times(1)).save(any(UsuarioModel.class));
    }

    @Test
    void autenticarUsuario_LanzaExcepcion_SiCorreoNoExiste() {
        when(usuarioRepository.findByCorreo("test@test.com")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            autenticacionService.autenticarUsuario(loginRequest);
        });

        assertEquals("Credenciales inválidas", exception.getMessage());
    }

    @Test
    void autenticarUsuario_LanzaExcepcion_SiContrasenaIncorrecta() {
        UsuarioModel usuario = new UsuarioModel();
        usuario.setContrasena("encodedPassword");
        when(usuarioRepository.findByCorreo("test@test.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("123456", "encodedPassword")).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            autenticacionService.autenticarUsuario(loginRequest);
        });

        assertEquals("Credenciales inválidas", exception.getMessage());
    }

    @Test
    void autenticarUsuario_RetornaToken_SiCredencialesSonCorrectas() {
        UsuarioModel usuario = new UsuarioModel();
        usuario.setCorreo("test@test.com");
        usuario.setContrasena("encodedPassword");
        when(usuarioRepository.findByCorreo("test@test.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("123456", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateToken("test@test.com")).thenReturn("fake-jwt-token");

        String token = autenticacionService.autenticarUsuario(loginRequest);

        assertEquals("fake-jwt-token", token);
    }
}
