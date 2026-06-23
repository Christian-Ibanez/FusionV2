package com.SanosySalvos.Notificaciones.repository;

import com.SanosySalvos.Notificaciones.model.PreferenciaUsuarioModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PreferenciaUsuarioRepository extends JpaRepository<PreferenciaUsuarioModel, Long> {
    Optional<PreferenciaUsuarioModel> findByCorreoUsuario(String correoUsuario);
}
