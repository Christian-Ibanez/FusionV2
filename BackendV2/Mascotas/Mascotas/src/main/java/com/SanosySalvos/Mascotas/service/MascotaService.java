package com.SanosySalvos.Mascotas.service;

import com.SanosySalvos.Mascotas.model.MascotaModel;
import com.SanosySalvos.Mascotas.repository.MascotaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MascotaService {
    private final MascotaRepository mascotaRepository;

    public MascotaService(MascotaRepository mascotaRepository) {
        this.mascotaRepository = mascotaRepository;
    }

    public List<MascotaModel> findAll() {
        return mascotaRepository.findAll();
    }

    public Optional<MascotaModel> findById(Long id) {
        return mascotaRepository.findById(id);
    }

    public MascotaModel save(MascotaModel mascota) {
        return mascotaRepository.save(mascota);
    }

    public void deleteById(Long id) {
        mascotaRepository.deleteById(id);
    }

    public MascotaModel update(Long id, MascotaModel updatedMascota) {
        return mascotaRepository.findById(id)
                .map(existing -> {
                    existing.setNombre(updatedMascota.getNombre());
                    existing.setRaza(updatedMascota.getRaza());
                    existing.setColor(updatedMascota.getColor());
                    existing.setEdad(updatedMascota.getEdad());
                    existing.setImagenUrl(updatedMascota.getImagenUrl());
                    return mascotaRepository.save(existing);
                })
                .orElseGet(() -> {
                    updatedMascota.setId(id);
                    return mascotaRepository.save(updatedMascota);
                });
    }
}
