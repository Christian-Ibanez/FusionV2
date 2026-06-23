package com.SanosySalvos.Mascotas.service;

import com.SanosySalvos.Mascotas.model.MascotaModel;
import com.SanosySalvos.Mascotas.repository.MascotaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MascotaServiceTest {

    @Mock
    private MascotaRepository mascotaRepository;

    @InjectMocks
    private MascotaService mascotaService;

    private MascotaModel mascota1;
    private MascotaModel mascota2;

    @BeforeEach
    void setUp() {
        mascota1 = new MascotaModel(1L, "Firulais", "Labrador", "Dorado", 3, "url1");
        mascota2 = new MascotaModel(2L, "Michi", "Persa", "Blanco", 2, "url2");
    }

    @Test
    void findAll_ShouldReturnListOfMascotas() {
        when(mascotaRepository.findAll()).thenReturn(Arrays.asList(mascota1, mascota2));

        List<MascotaModel> result = mascotaService.findAll();

        assertEquals(2, result.size());
        assertEquals("Firulais", result.get(0).getNombre());
        verify(mascotaRepository, times(1)).findAll();
    }

    @Test
    void findById_ShouldReturnMascota_WhenExists() {
        when(mascotaRepository.findById(1L)).thenReturn(Optional.of(mascota1));

        Optional<MascotaModel> result = mascotaService.findById(1L);

        assertTrue(result.isPresent());
        assertEquals("Firulais", result.get().getNombre());
        verify(mascotaRepository, times(1)).findById(1L);
    }

    @Test
    void save_ShouldReturnSavedMascota() {
        when(mascotaRepository.save(mascota1)).thenReturn(mascota1);

        MascotaModel result = mascotaService.save(mascota1);

        assertNotNull(result);
        assertEquals("Firulais", result.getNombre());
        verify(mascotaRepository, times(1)).save(mascota1);
    }

    @Test
    void deleteById_ShouldCallRepositoryDeleteById() {
        doNothing().when(mascotaRepository).deleteById(1L);

        mascotaService.deleteById(1L);

        verify(mascotaRepository, times(1)).deleteById(1L);
    }

    @Test
    void update_ShouldUpdateExistingMascota_WhenExists() {
        MascotaModel updatedMascota = new MascotaModel(null, "Fido", "Pug", "Negro", 4, "url3");
        when(mascotaRepository.findById(1L)).thenReturn(Optional.of(mascota1));
        when(mascotaRepository.save(any(MascotaModel.class))).thenReturn(mascota1);

        MascotaModel result = mascotaService.update(1L, updatedMascota);

        assertEquals("Fido", result.getNombre());
        assertEquals("Pug", result.getRaza());
        verify(mascotaRepository, times(1)).findById(1L);
        verify(mascotaRepository, times(1)).save(mascota1);
    }

    @Test
    void update_ShouldSaveNewMascota_WhenNotExists() {
        MascotaModel newMascota = new MascotaModel(null, "Max", "Bulldog", "Blanco", 1, "url4");
        when(mascotaRepository.findById(3L)).thenReturn(Optional.empty());
        when(mascotaRepository.save(any(MascotaModel.class))).thenReturn(newMascota);

        MascotaModel result = mascotaService.update(3L, newMascota);

        assertEquals("Max", result.getNombre());
        verify(mascotaRepository, times(1)).findById(3L);
        verify(mascotaRepository, times(1)).save(newMascota);
    }
}
