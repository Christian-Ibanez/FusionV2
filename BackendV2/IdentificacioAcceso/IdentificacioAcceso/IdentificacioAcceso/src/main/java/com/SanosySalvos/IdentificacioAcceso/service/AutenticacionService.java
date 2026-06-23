package com.SanosySalvos.IdentificacioAcceso.service;

import com.SanosySalvos.IdentificacioAcceso.dto.LoginRequest;
import com.SanosySalvos.IdentificacioAcceso.dto.RegistroRequest;
import com.SanosySalvos.IdentificacioAcceso.model.UsuarioModel;
import com.SanosySalvos.IdentificacioAcceso.repository.UsuarioRepository;
import com.SanosySalvos.IdentificacioAcceso.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AutenticacionService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.SanosySalvos.IdentificacioAcceso.client.UsuarioClient usuarioClient;

    public void registrarUsuario(RegistroRequest peticion) {
        Optional<UsuarioModel> existeUsuario = usuarioRepository.findByCorreo(peticion.getCorreo());
        if (existeUsuario.isPresent()) {
            throw new RuntimeException("Este correo ya está en uso. ¿Deseas iniciar sesión?");
        }

        UsuarioModel nuevoUsuario = new UsuarioModel(
                peticion.getCorreo(),
                passwordEncoder.encode(peticion.getContrasena()),
                peticion.getRol() != null ? peticion.getRol() : com.SanosySalvos.IdentificacioAcceso.model.RolModel.USUARIO,
                peticion.getNombreInstitucion(),
                peticion.getUrlLogoInstitucion()
        );

        // 1. Guardar en la base de datos de identidad (id_db)
        usuarioRepository.save(nuevoUsuario);

        // 2. Comunicarse con el microservicio de Usuarios para crear el perfil asociado
        try {
            java.util.Map<String, String> datosUsuario = new java.util.HashMap<>();
            datosUsuario.put("correo", peticion.getCorreo());
            datosUsuario.put("nombre", peticion.getNombre() != null ? peticion.getNombre() : "Usuario Nuevo");
            datosUsuario.put("telefono", peticion.getTelefono() != null ? peticion.getTelefono() : "");
            usuarioClient.crearPerfilInicial(datosUsuario);
        } catch (Exception e) {
            throw new RuntimeException("Credenciales creadas, pero hubo un error al crear el perfil en Usuarios: " + e.getMessage());
        }
    }

    public String autenticarUsuario(LoginRequest peticion) {
        UsuarioModel usuario = usuarioRepository.findByCorreo(peticion.getCorreo())
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

        if (!passwordEncoder.matches(peticion.getContrasena(), usuario.getContrasena())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        return jwtUtil.generateToken(usuario.getCorreo());
    }
}
