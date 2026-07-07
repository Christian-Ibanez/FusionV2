package com.SanosySalvos.Reportes.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;
import java.nio.file.Files;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class HuggingFaceServiceTest {

    @InjectMocks
    private HuggingFaceService huggingFaceService;

    @Test
    public void testImageUrlNullOrEmpty() {
        assertNull(huggingFaceService.generarVectorDeImagen(null));
        assertNull(huggingFaceService.generarVectorDeImagen(""));
    }

    @Test
    public void testApiKeyNullOrInvalid() {
        ReflectionTestUtils.setField(huggingFaceService, "apiKey", null);
        assertNotNull(huggingFaceService.generarVectorDeImagen("http://test.com/image.jpg"));
        
        ReflectionTestUtils.setField(huggingFaceService, "apiKey", "");
        assertNotNull(huggingFaceService.generarVectorDeImagen("http://test.com/image.jpg"));

        ReflectionTestUtils.setField(huggingFaceService, "apiKey", "your_huggingface_api_key_here");
        assertNotNull(huggingFaceService.generarVectorDeImagen("http://test.com/image.jpg"));
    }

    @Test
    public void testApiKeyValid_Base64Invalid() {
        ReflectionTestUtils.setField(huggingFaceService, "apiKey", "valid_key");
        assertNull(huggingFaceService.generarVectorDeImagen("data:image/png;base64_invalid"));
    }

    @Test
    public void testApiKeyValid_Base64Valid() {
        ReflectionTestUtils.setField(huggingFaceService, "apiKey", "valid_key");
        String base64 = java.util.Base64.getEncoder().encodeToString("test".getBytes());
        assertNotNull(huggingFaceService.generarVectorDeImagen("data:image/png;base64," + base64));
    }

    @Test
    public void testApiKeyValid_LocalFileInvalid() {
        ReflectionTestUtils.setField(huggingFaceService, "apiKey", "valid_key");
        assertNull(huggingFaceService.generarVectorDeImagen("/app/imagenes_prueba/noexiste.jpg"));
    }

    @Test
    public void testApiKeyValid_LocalFileValid() throws Exception {
        ReflectionTestUtils.setField(huggingFaceService, "apiKey", "valid_key");
        File tempFile = File.createTempFile("test", ".jpg");
        tempFile.deleteOnExit();
        Files.write(tempFile.toPath(), "test".getBytes());
        
        String path = "/app/imagenes_prueba/" + tempFile.getName();
        File mockDir = new File("/app/imagenes_prueba");
        mockDir.mkdirs();
        File mockFile = new File(mockDir, tempFile.getName());
        Files.write(mockFile.toPath(), "test".getBytes());
        mockFile.deleteOnExit();

        assertNotNull(huggingFaceService.generarVectorDeImagen(mockFile.getAbsolutePath().replace("\\", "/")));
        assertNotNull(huggingFaceService.generarVectorDeImagen("/app/imagenes_prueba/" + tempFile.getName()));
    }

    @Test
    public void testApiKeyValid_HttpUrl() {
        ReflectionTestUtils.setField(huggingFaceService, "apiKey", "valid_key");
        assertNotNull(huggingFaceService.generarVectorDeImagen("http://invalid-url-that-will-fail.com/image.jpg"));
    }
}
