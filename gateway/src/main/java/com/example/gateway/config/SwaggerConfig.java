package com.example.gateway.config;

import org.springframework.context.annotation.Configuration;

/**
 * Swagger / OpenAPI aggregation configuration for the API Gateway.
 *
 * <p>The gateway aggregates Swagger documentation from all downstream microservices.
 * Each microservice exposes its own {@code /v3/api-docs} endpoint, and the gateway
 * proxies these via routes defined in {@code application.properties}.</p>
 *
 * <p>Access the aggregated Swagger UI at:
 * <a href="http://localhost:8085/swagger-ui.html">http://localhost:8085/swagger-ui.html</a></p>
 *
 * <p>All route definitions and SpringDoc UI group URLs are configured in
 * {@code application.properties} under the {@code springdoc.swagger-ui.urls} keys.</p>
 */
@Configuration
public class SwaggerConfig {
    // All springdoc / swagger aggregation config is in application.properties
    // No additional beans required; springdoc-openapi-starter-webflux-ui
    // auto-configures the Swagger UI and api-docs endpoints.
}
