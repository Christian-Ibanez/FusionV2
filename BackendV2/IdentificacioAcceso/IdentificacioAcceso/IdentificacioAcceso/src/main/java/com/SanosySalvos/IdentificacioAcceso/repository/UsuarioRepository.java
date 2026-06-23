package com.SanosySalvos.IdentificacioAcceso.repository;

import com.SanosySalvos.IdentificacioAcceso.model.UsuarioModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<UsuarioModel, Long> {
    Optional<UsuarioModel> findByCorreo(String correo);
}
