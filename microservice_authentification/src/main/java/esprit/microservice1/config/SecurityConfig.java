package esprit.microservice1.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .cors(cors -> cors.disable()) // Disable individual CORS to let Gateway handle it
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                        "/v3/api-docs/**",
                                                        "/v3/api-docs",
                                                        "/swagger-ui.html",
                                                        "/swagger-ui/**",
                                                        "/webjars/**"
                                                ).permitAll()
                                                .requestMatchers("/api/auth/login", "/api/auth/register",
                                                                "/api/auth/refresh", "/api/auth/social-login",
                                                                "/api/auth/login-faceid", "/api/auth/users/**")
                                                .permitAll()
                                                .anyRequest().authenticated())
                                .oauth2ResourceServer(oauth2 -> oauth2
                                                .jwt(jwt -> jwt.jwtAuthenticationConverter(
                                                                jwtAuthenticationConverter())))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

                return http.build();
        }

        @Bean
        public JwtAuthenticationConverter jwtAuthenticationConverter() {
                JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
                converter.setJwtGrantedAuthoritiesConverter(new KeycloakRoleConverter());
                return converter;
        }

        /**
         * Converter to extract roles from Keycloak JWT token
         */
        static class KeycloakRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
                @Override
                public Collection<GrantedAuthority> convert(Jwt jwt) {
                        // Extract roles from realm_access claim
                        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
                        if (realmAccess != null && realmAccess.containsKey("roles")) {
                                @SuppressWarnings("unchecked")
                                List<String> roles = (List<String>) realmAccess.get("roles");
                                return roles.stream()
                                                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                                                .collect(Collectors.toList());
                        }
                        return List.of();
                }
        }
}
