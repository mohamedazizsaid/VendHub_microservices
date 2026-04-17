package com.example.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class GatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(GatewayApplication.class, args);
	}

	@Bean
	public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
		return builder.routes()
				.route("microservice1",
						r -> r.path("/api/auth/**", "/api/auth")
								.uri("lb://microservice1"))
				.route("microservice2",
						r -> r.path("/api/products/**", "/api/products")
								.uri("lb://microservice2"))
				.route("microservice3",
						r -> r.path("/api/events/**", "/api/events")
								.uri("lb://microservice3"))
				.route("reclamation_route",
						r -> r.path("/api/reclamations/**", "/api/reclamations")
								.uri("lb://microservice4"))
				.route("feedback_route",
						r -> r.path("/api/feedbacks/**", "/api/feedbacks")
								.uri("lb://microservice4"))
				.route("microservice5",
						r -> r.path("/api/forums/**", "/api/messages/**", "/api/forums", "/api/messages")
								.uri("lb://microservice5"))
				.route("microservice6",
						r -> r.path("/api6/**")
								.uri("lb://microservice6"))
				.build();
	}
}
