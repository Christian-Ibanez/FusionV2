package com.SanosySalvos.Usuarios;

import com.SanosySalvos.Usuarios.model.RolUsuario;
import com.SanosySalvos.Usuarios.model.Usuario;
import com.SanosySalvos.Usuarios.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@sanosysalvos.cl";
        if (!usuarioRepository.existsByCorreoElectronico(adminEmail)) {
            Usuario admin = new Usuario();
            admin.setCorreoElectronico(adminEmail);
            admin.setNombreCompleto("Administrador Principal");
            admin.setContrasena("PROTEGIDA_EN_AUTH");
            admin.setRol(RolUsuario.ADMINISTRADOR); // O el rol correspondiente
            admin.setCuentaValidada(true);
            
            usuarioRepository.save(admin);
            System.out.println("Perfil de Administrador creado en Usuarios: " + adminEmail);
        }
    }
}
