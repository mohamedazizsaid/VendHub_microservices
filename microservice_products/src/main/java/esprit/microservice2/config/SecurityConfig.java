package esprit.microservice2.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.disable())
                .authorizeHttpRequests(auth -> auth
                        // ✅ Swagger UI (Spring Boot 3 compatible)
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/swagger-resources/**").permitAll()
                        .requestMatchers("/webjars/**").permitAll()

                        // H2 console
                        .requestMatchers("/h2/**").permitAll()

                        // Endpoints protégés (user authentifié requis)
                        .requestMatchers("/api/products/favorites/**").authenticated()
                        .requestMatchers("/api/products/*/click").authenticated()
                        .requestMatchers("/api/products/*/favorite").authenticated()
                        .requestMatchers("/api/products/recommendations").authenticated()
                        .requestMatchers("/api/products/my-stats").authenticated()

                        // Endpoints publics
                        .requestMatchers("/api/products/popular").permitAll()
                        .requestMatchers("/api/products/**").permitAll()

                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> {})
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }
    }
