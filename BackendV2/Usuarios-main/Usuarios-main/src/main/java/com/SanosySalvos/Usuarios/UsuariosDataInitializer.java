package com.SanosySalvos.Usuarios;

import com.SanosySalvos.Usuarios.model.RolUsuario;
import com.SanosySalvos.Usuarios.model.Usuario;
import com.SanosySalvos.Usuarios.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class UsuariosDataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@sanosysalvos.cl";
        Optional<Usuario> adminOpt = usuarioRepository.findByCorreoElectronico(adminEmail);
        if (adminOpt.isEmpty()) {
            Usuario admin = new Usuario();
            admin.setCorreoElectronico(adminEmail);
            admin.setNombreCompleto("Administrador");
            admin.setContrasena(""); // IdentificacioAcceso maneja la contraseña real
            admin.setTelefono("999999999");
            admin.setRol(RolUsuario.ADMINISTRADOR);
            admin.setCuentaValidada(true);
            admin.setFechaRegistro(LocalDateTime.now());
            usuarioRepository.save(admin);
            System.out.println("Administrador creado en Usuarios-main: " + adminEmail);
        }
    }
}
