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

        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your_huggingface_api_key_here")) {
            System.out.println("⚠️ No hay API Key válida configurada. Generando vector falso (Mock) instantáneamente...");
            return mockVector();
        }

        try {
            org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(5000);
            factory.setReadTimeout(5000);
            RestTemplate restTemplate = new RestTemplate(factory);
            
            byte[] imageBytes;
            if (imageUrl.startsWith("data:image/")) {
                int commaIndex = imageUrl.indexOf(",");
                if (commaIndex != -1) {
                    String base64Data = imageUrl.substring(commaIndex + 1);
                    imageBytes = java.util.Base64.getDecoder().decode(base64Data);
                } else {
                    System.err.println("Error: Formato Base64 inválido.");
                    return null;
                }
            } else if (imageUrl.startsWith("/app/imagenes_prueba/")) {
                try {
                    imageBytes = java.nio.file.Files.readAllBytes(java.nio.file.Paths.get(imageUrl));
                } catch (Exception e) {
                    System.err.println("Error al leer archivo local: " + e.getMessage());
                    return null;
                }
            } else {
                imageBytes = restTemplate.getForObject(imageUrl, byte[].class);
            }
            
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
