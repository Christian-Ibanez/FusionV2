package com.SanosySalvos.Coincidencias.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ImageComparisonUtilTest {

    @Test
    void testConstructor() {
        // Instantiate the utility class to cover the implicit public constructor
        assertNotNull(new ImageComparisonUtil());
    }

    @Test
    void testCompareImages_BothNull() {
        assertEquals(0.0, ImageComparisonUtil.compareImages(null, null));
    }

    @Test
    void testCompareImages_OneNull() {
        assertEquals(0.0, ImageComparisonUtil.compareImages("url1", null));
        assertEquals(0.0, ImageComparisonUtil.compareImages(null, "url2"));
    }

    @Test
    void testCompareImages_SameUrl() {
        assertEquals(100.0, ImageComparisonUtil.compareImages("url1", "url1"));
    }

    @Test
    void testCompareImages_InvalidUrl() {
        // Will throw an exception and return 0.0
        assertEquals(0.0, ImageComparisonUtil.compareImages("invalid-url", "invalid-url-2"));
    }

    @Test
    void testCompareImages_ValidImages() throws java.io.IOException {
        java.io.File tempFile1 = java.io.File.createTempFile("testImage1", ".png");
        java.io.File tempFile2 = java.io.File.createTempFile("testImage2", ".png");
        tempFile1.deleteOnExit();
        tempFile2.deleteOnExit();

        // Image 1: Half white, half black
        java.awt.image.BufferedImage img1 = new java.awt.image.BufferedImage(10, 10, java.awt.image.BufferedImage.TYPE_INT_RGB);
        java.awt.Graphics2D g1 = img1.createGraphics();
        g1.setColor(java.awt.Color.WHITE);
        g1.fillRect(0, 0, 10, 5);
        g1.setColor(java.awt.Color.BLACK);
        g1.fillRect(0, 5, 10, 5);
        g1.dispose();
        javax.imageio.ImageIO.write(img1, "png", tempFile1);

        // Image 2: Different pattern to produce a different hash
        java.awt.image.BufferedImage img2 = new java.awt.image.BufferedImage(10, 10, java.awt.image.BufferedImage.TYPE_INT_RGB);
        java.awt.Graphics2D g2 = img2.createGraphics();
        g2.setColor(java.awt.Color.BLACK);
        g2.fillRect(0, 0, 10, 5);
        g2.setColor(java.awt.Color.WHITE);
        g2.fillRect(0, 5, 10, 5);
        g2.dispose();
        javax.imageio.ImageIO.write(img2, "png", tempFile2);

        String url1 = tempFile1.toURI().toURL().toString();
        String url2 = tempFile2.toURI().toURL().toString();

        double result = ImageComparisonUtil.compareImages(url1, url2);
        assertTrue(result >= 0.0 && result <= 100.0);
    }

    @Test
    void testCompareImages_ImageIoReturnsNull() throws java.io.IOException {
        // ImageIO.read returns null if no registered ImageReader claims to be able to read the stream (e.g. a text file)
        java.io.File textFile = java.io.File.createTempFile("notanimage", ".txt");
        textFile.deleteOnExit();
        java.nio.file.Files.writeString(textFile.toPath(), "Hello World");
        
        String url = textFile.toURI().toURL().toString();
        
        // This should trigger the img1 == null || img2 == null condition (after ImageIO.read)
        // Wait, if it can't read it, it might return null.
        // I will pass a valid image and a text file to cover all branches.
        java.io.File validImg = java.io.File.createTempFile("valid", ".png");
        validImg.deleteOnExit();
        java.awt.image.BufferedImage img = new java.awt.image.BufferedImage(1, 1, java.awt.image.BufferedImage.TYPE_INT_RGB);
        javax.imageio.ImageIO.write(img, "png", validImg);
        
        String validUrl = validImg.toURI().toURL().toString();
        
        assertEquals(0.0, ImageComparisonUtil.compareImages(validUrl, url));
        assertEquals(0.0, ImageComparisonUtil.compareImages(url, validUrl));
        assertEquals(100.0, ImageComparisonUtil.compareImages(url, url)); // Because of equals, this returns 100.0 first!
    }
}
