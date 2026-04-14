package tn.esprit.microservice4.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.microservice4.entities.Reclamation;

import java.util.List;

@Repository
public interface ReclamationRepository extends JpaRepository<Reclamation, Long> {
    List<Reclamation> findByUserId(Long userId);
    List<Reclamation> findByCommandeId(Long commandeId);
    List<Reclamation> findByStatus(String status);
}