package com.SanosySalvos.Mascotas.controller;

import com.SanosySalvos.Mascotas.model.MascotaModel;
import com.SanosySalvos.Mascotas.service.MascotaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MascotaController.class)
public class MascotaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MascotaService mascotaService;

    @Autowired
    private ObjectMapper objectMapper;

    private MascotaModel mascota1;
    private MascotaModel mascota2;

    @BeforeEach
    void setUp() {
        mascota1 = new MascotaModel(1L, "Firulais", "Labrador", "Dorado", 3, "url1");
        mascota2 = new MascotaModel(2L, "Michi", "Persa", "Blanco", 2, "url2");
    }

    @Test
    void getAllMascotas_ShouldReturn200() throws Exception {
        when(mascotaService.findAll()).thenReturn(Arrays.asList(mascota1, mascota2));

        mockMvc.perform(get("/api/mascotas/listar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].nombre").value("Firulais"));

        verify(mascotaService, times(1)).findAll();
    }

    @Test
    void getMascotaById_ShouldReturn200_WhenExists() throws Exception {
        when(mascotaService.findById(1L)).thenReturn(Optional.of(mascota1));

        mockMvc.perform(get("/api/mascotas/obtener/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Firulais"));

        verify(mascotaService, times(1)).findById(1L);
    }

    @Test
    void getMascotaById_ShouldReturn404_WhenNotExists() throws Exception {
        when(mascotaService.findById(3L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/mascotas/obtener/3"))
                .andExpect(status().isNotFound());

        verify(mascotaService, times(1)).findById(3L);
    }

    @Test
    void createMascota_ShouldReturn200() throws Exception {
        when(mascotaService.save(any(MascotaModel.class))).thenReturn(mascota1);

        mockMvc.perform(post("/api/mascotas/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mascota1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Firulais"));

        verify(mascotaService, times(1)).save(any(MascotaModel.class));
    }

    @Test
    void updateMascota_ShouldReturn200_WhenExists() throws Exception {
        when(mascotaService.findById(1L)).thenReturn(Optional.of(mascota1));
        when(mascotaService.update(eq(1L), any(MascotaModel.class))).thenReturn(mascota1);

        mockMvc.perform(put("/api/mascotas/modificar/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mascota1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Firulais"));

        verify(mascotaService, times(1)).findById(1L);
        verify(mascotaService, times(1)).update(eq(1L), any(MascotaModel.class));
    }

    @Test
    void updateMascota_ShouldReturn404_WhenNotExists() throws Exception {
        when(mascotaService.findById(3L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/mascotas/modificar/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mascota1)))
                .andExpect(status().isNotFound());

        verify(mascotaService, times(1)).findById(3L);
        verify(mascotaService, never()).update(any(), any());
    }

    @Test
    void deleteMascota_ShouldReturn204_WhenExists() throws Exception {
        when(mascotaService.findById(1L)).thenReturn(Optional.of(mascota1));
        doNothing().when(mascotaService).deleteById(1L);

        mockMvc.perform(delete("/api/mascotas/eliminar/1"))
                .andExpect(status().isNoContent());

        verify(mascotaService, times(1)).findById(1L);
        verify(mascotaService, times(1)).deleteById(1L);
    }

    @Test
    void deleteMascota_ShouldReturn404_WhenNotExists() throws Exception {
        when(mascotaService.findById(3L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/mascotas/eliminar/3"))
                .andExpect(status().isNotFound());

        verify(mascotaService, times(1)).findById(3L);
        verify(mascotaService, never()).deleteById(3L);
    }
}
