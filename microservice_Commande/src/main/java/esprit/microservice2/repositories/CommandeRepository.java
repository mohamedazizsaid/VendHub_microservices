package esprit.microservice2.repositories;

import esprit.microservice2.entities.Commande;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommandeRepository extends JpaRepository<Commande, Long> {
    List<Commande> findByClientIdOrderByCreatedAtDesc(String clientId);
}
