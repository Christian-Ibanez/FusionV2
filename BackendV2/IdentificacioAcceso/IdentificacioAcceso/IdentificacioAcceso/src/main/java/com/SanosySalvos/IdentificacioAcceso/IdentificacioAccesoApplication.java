package com.SanosySalvos.IdentificacioAcceso;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class IdentificacioAccesoApplication {

	public static void main(String[] args) {
		SpringApplication.run(IdentificacioAccesoApplication.class, args);
	}

}
