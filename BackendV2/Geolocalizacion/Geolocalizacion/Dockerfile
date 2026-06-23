# Etapa 1: Construcción (Build)
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Copiamos el pom.xml y descargamos dependencias para aprovechar la caché de Docker
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiamos el código fuente y compilamos
COPY src ./src
RUN mvn clean package -Dmaven.test.skip=true

# Etapa 2: Ejecución (Run)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copiamos el JAR generado en la etapa de build
COPY --from=builder /app/target/*.jar app.jar

# Exponemos el puerto de la aplicación (por defecto Spring Boot usa 8080)
EXPOSE 8080

# Comando de inicio de la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
