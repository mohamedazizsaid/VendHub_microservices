package tn.esprit.microservice4.configuration;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Bean
    @LoadBalanced  // Permet d'utiliser les noms de services Eureka au lieu des URLs
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    // NOTE: la gestion CORS est déléguée à l'API Gateway (port 8085).
    // Nous retirons la configuration CORS locale pour éviter l'envoi en double
    // de l'en-tête Access-Control-Allow-Origin quand la gateway le fournit.
}