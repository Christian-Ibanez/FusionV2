package com.SanosySalvos.Geolocalizacion.repository;

import com.SanosySalvos.Geolocalizacion.model.Reporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, Long> {

    // HU-1: Buscar reportes activos en un radio específico usando ST_DWithin (PostGIS)
    @Query(value = "SELECT * FROM reportes r WHERE r.estado = 'ACTIVO' AND " +
            "ST_DWithin(r.ubicacion, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radioKm * 1000)", nativeQuery = true)
    List<Reporte> findActivosCercanos(@Param("lat") Double lat, 
                                      @Param("lng") Double lng, 
                                      @Param("radioKm") Double radioKm);

    // HU-2: Mapa de calor filtrado por fecha
    List<Reporte> findByFechaCreacionBetween(LocalDateTime inicio, LocalDateTime fin);

    // HU-3: Buscar reportes cercanos de un tipo específico usando ST_DWithin (PostGIS)
    @Query(value = "SELECT * FROM reportes r WHERE r.tipo = :tipo AND " +
            "ST_DWithin(r.ubicacion, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radioKm * 1000)", nativeQuery = true)
    List<Reporte> findCercanosPorTipo(@Param("lat") Double lat, 
                                      @Param("lng") Double lng, 
                                      @Param("radioKm") Double radioKm, 
                                      @Param("tipo") String tipo);
}
