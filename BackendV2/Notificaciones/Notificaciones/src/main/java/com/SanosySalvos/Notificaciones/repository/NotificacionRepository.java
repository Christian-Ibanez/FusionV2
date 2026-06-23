package com.SanosySalvos.Notificaciones.repository;

import com.SanosySalvos.Notificaciones.model.NotificacionModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<NotificacionModel, Long> {
    List<NotificacionModel> findByCorreoUsuarioOrderByFechaCreacionDesc(String correoUsuario);
}
