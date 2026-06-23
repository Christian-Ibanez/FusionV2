package com.SanosySalvos.Mascotas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.SanosySalvos.Mascotas.model.MascotaModel;

@Repository
public interface MascotaRepository extends JpaRepository<MascotaModel, Long> {

}
