package com.SanosySalvos.Coincidencias.util;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.net.URL;

public class ImageComparisonUtil {

    /**
     * Compara dos imágenes usando aHash (Average Hash) y devuelve un porcentaje de similitud (0.0 a 100.0).
     * @param url1 URL de la primera imagen
     * @param url2 URL de la segunda imagen
     * @return Porcentaje de similitud
     */
    public static double compareImages(String url1, String url2) {
        if (url1 == null || url2 == null) return 0.0;
        if (url1.equals(url2)) return 100.0;

        try {
            BufferedImage img1 = ImageIO.read(new URL(url1));
            BufferedImage img2 = ImageIO.read(new URL(url2));

            if (img1 == null || img2 == null) return 0.0;

            String hash1 = getAverageHash(img1);
            String hash2 = getAverageHash(img2);

            int distance = calculateHammingDistance(hash1, hash2);
            
            // 64 bits en total
            double similarity = (64.0 - distance) / 64.0;
            return Math.round(similarity * 100.0 * 100.0) / 100.0; // redondeo a 2 decimales, ej. 85.94

        } catch (Exception e) {
            System.err.println("Error al descargar o comparar imágenes: " + e.getMessage());
            return 0.0; 
        }
    }

    private static String getAverageHash(BufferedImage image) {
        // Redimensionar a 8x8 y convertir a escala de grises
        BufferedImage resizedImage = new BufferedImage(8, 8, BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g = resizedImage.createGraphics();
        g.drawImage(image.getScaledInstance(8, 8, Image.SCALE_SMOOTH), 0, 0, null);
        g.dispose();

        // Calcular el promedio de los píxeles
        long totalPixelValue = 0;
        int[] pixels = new int[64];
        int index = 0;
        for (int y = 0; y < 8; y++) {
            for (int x = 0; x < 8; x++) {
                int rgb = resizedImage.getRGB(x, y);
                int gray = rgb & 0xFF; 
                pixels[index++] = gray;
                totalPixelValue += gray;
            }
        }

        long averageValue = totalPixelValue / 64;

        // Construir el hash de 64 bits como string
        StringBuilder hash = new StringBuilder(64);
        for (int pixel : pixels) {
            hash.append(pixel >= averageValue ? "1" : "0");
        }

        return hash.toString();
    }

    private static int calculateHammingDistance(String hash1, String hash2) {
        int distance = 0;
        for (int i = 0; i < hash1.length(); i++) {
            if (hash1.charAt(i) != hash2.charAt(i)) {
                distance++;
            }
        }
        return distance;
    }
}
