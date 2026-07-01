package com.SanosySalvos.Reportes.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;

@Service
public class HuggingFaceService {

    @Value("${huggingface.api.key:}")
    private String apiKey;

    private final String API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/clip-ViT-B-32";

    public String generarVectorDeImagen(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return null;
        }

        if (apiKey == null || apiKey.isEmpty()) {
            System.out.println("⚠️ No hay API Key de Hugging Face configurada. Generando vector falso (Mock)...");
            return mockVector();
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            
            // 1. Descargar la imagen desde su URL (Cloudinary, S3, etc.)
            byte[] imageBytes = restTemplate.getForObject(imageUrl, byte[].class);
            
            if (imageBytes == null) {
                System.err.println("Error: No se pudo descargar la imagen para convertirla a vector.");
                return null;
            }

            // 2. Enviar los bytes a la API de Hugging Face
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("Content-Type", "application/octet-stream");

            HttpEntity<byte[]> entity = new HttpEntity<>(imageBytes, headers);

            ResponseEntity<float[]> response = restTemplate.exchange(
                    API_URL, 
                    HttpMethod.POST, 
                    entity, 
                    float[].class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                float[] vector = response.getBody();
                return Arrays.toString(vector); // Retorna el formato "[val1, val2, ...]" que pgvector acepta
            }

        } catch (Exception e) {
            System.err.println("❌ Error en la API de Hugging Face: " + e.getMessage());
        }
        
        // En caso de fallo o timeout de Hugging Face (por ser capa gratuita), devuelve un mock
        return mockVector();
    }

    private String mockVector() {
        // Genera un vector aleatorio de 512 dimensiones
        StringBuilder sb = new StringBuilder("[");
        for(int i = 0; i < 512; i++) {
            sb.append(Math.random() - 0.5);
            if (i < 511) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
}
