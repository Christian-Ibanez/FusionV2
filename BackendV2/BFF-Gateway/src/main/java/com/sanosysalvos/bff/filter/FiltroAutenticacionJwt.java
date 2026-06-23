package com.sanosysalvos.bff.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Decoders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.List;

@Component
public class FiltroAutenticacionJwt implements GlobalFilter, Ordered {

    @Value("${jwt.secret}")
    private String secret;

    // Rutas que no requieren token
    private final List<String> rutasAbiertas = List.of(
            "/api/auth/login",
            "/api/auth/registro",
            "/api/identificacion/login",
            "/api/identificacion/registro",
            "/api/usuarios/registro"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // 1. Permitir el paso si es una ruta abierta
        if (rutasAbiertas.stream().anyMatch(path::startsWith)) {
            return chain.filter(exchange);
        }

        // 2. Verificar que exista el header de Authorization
        if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            return onError(exchange, "No se encontró el header Authorization", HttpStatus.UNAUTHORIZED);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, "El header debe empezar con Bearer", HttpStatus.UNAUTHORIZED);
        }

        // 3. Extraer y validar el token
        String token = authHeader.substring(7);

        try {
            Key key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
            
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            // Opcional: Pasar el correo al microservicio interno en un header nuevo
            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .header("X-Usuario-Correo", claims.getSubject())
                    .build();
            
            return chain.filter(exchange.mutate().request(mutatedRequest).build());

        } catch (Exception e) {
            return onError(exchange, "Token JWT inválido o expirado", HttpStatus.UNAUTHORIZED);
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }

    @Override
    public int getOrder() {
        return -1; // Se ejecuta antes que los filtros de ruteo
    }
}
