package com.SanosySalvos.IdentificacioAcceso;

import com.SanosySalvos.IdentificacioAcceso.model.RolModel;
import com.SanosySalvos.IdentificacioAcceso.model.UsuarioModel;
import com.SanosySalvos.IdentificacioAcceso.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@sanosysalvos.cl";
        Optional<UsuarioModel> adminOpt = usuarioRepository.findByCorreo(adminEmail);
        if (adminOpt.isEmpty()) {
            UsuarioModel admin = new UsuarioModel(
                    adminEmail,
                    passwordEncoder.encode("admin123"),
                    RolModel.COLABORADOR,
                    "Sanos y Salvos",
                    ""
            );
            usuarioRepository.save(admin);
            System.out.println("Administrador creado en IdentificacioAcceso: " + adminEmail);
        }
    }
}
