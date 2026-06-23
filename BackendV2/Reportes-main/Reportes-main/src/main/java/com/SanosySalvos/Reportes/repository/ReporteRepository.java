package com.SanosySalvos.Reportes.repository;

import java.util.List;

import org.springframework.data.geo.Point;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.SanosySalvos.Reportes.model.EstadoReporte;
import com.SanosySalvos.Reportes.model.Reporte;
import com.SanosySalvos.Reportes.model.TipoReporte;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, Long> {

    List<Reporte> findByEstado(EstadoReporte estado);

    List<Reporte> findByUsuarioId(Long usuarioId);
    
    List<Reporte> findByTipoReporte(TipoReporte tipoReporte);

    @Query(value = "SELECT * FROM reportes r WHERE ST_DistanceSphere(r.ubicacion, :puntoOrigen) <= :radioMetros", nativeQuery = true)
    List<Reporte> buscarMascotasCercanas(@Param("puntoOrigen") Point puntoOrigen, @Param("radioMetros") double radioMetros);
}
