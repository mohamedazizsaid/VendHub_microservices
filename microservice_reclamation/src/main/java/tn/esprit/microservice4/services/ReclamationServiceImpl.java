package tn.esprit.microservice4.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import tn.esprit.microservice4.entities.Reclamation;
import tn.esprit.microservice4.repositories.ReclamationRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReclamationServiceImpl implements IReclamationService {

    private final ReclamationRepository reclamationRepository;

    private final RestTemplate restTemplate;

    @Override
    @Transactional
    public Reclamation createReclamation(Reclamation reclamation) {
        // Vérifier que l'utilisateur existe via Eureka
        try {
            restTemplate.getForObject(
                    "http://microservice1-users/api/users/" + reclamation.getUserId(),
                    Object.class
            );
            log.info("User with id {} exists", reclamation.getUserId());
        } catch (Exception e) {
            log.error("User not found with id: {}", reclamation.getUserId());
            throw new RuntimeException("User not found with id: " + reclamation.getUserId());
        }

        // Vérifier que le produit existe via Eureka
        try {
            // Vérifier que la commande existe via le microservice Commande
            restTemplate.getForObject(
                    "http://microservice_commande/api/commandes/" + reclamation.getCommandeId(),
                    Object.class
            );
            log.info("Commande with id {} exists", reclamation.getCommandeId());
        } catch (Exception e) {
            log.error("Commande not found with id: {}", reclamation.getCommandeId());
            throw new RuntimeException("Commande not found with id: " + reclamation.getCommandeId());
        }

        Reclamation saved = reclamationRepository.save(reclamation);
        log.info("Reclamation created with id: {}", saved.getId());
        return saved;
    }

    @Override
    public Reclamation getReclamationById(Long id) {
        return reclamationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamation not found with id: " + id));
    }

    @Override
    public List<Reclamation> getAllReclamations() {
        return reclamationRepository.findAll();
    }

    @Override
    public List<Reclamation> getReclamationsByUserId(Long userId) {
        return reclamationRepository.findByUserId(userId);
    }

    @Override
    public List<Reclamation> getReclamationsByCommandeId(Long commandeId) {
        return reclamationRepository.findByCommandeId(commandeId);
    }

    @Override
    public List<Reclamation> getReclamationsByStatus(String status) {
        return reclamationRepository.findByStatus(status);
    }

    @Override
    @Transactional
    public Reclamation updateReclamation(Long id, Reclamation reclamation) {
        Reclamation existing = getReclamationById(id);

        if (reclamation.getTitle() != null) {
            existing.setTitle(reclamation.getTitle());
        }
        if (reclamation.getDescription() != null) {
            existing.setDescription(reclamation.getDescription());
        }
        if (reclamation.getStatus() != null) {
            existing.setStatus(reclamation.getStatus());
        }

        Reclamation updated = reclamationRepository.save(existing);
        log.info("Reclamation updated with id: {}", updated.getId());
        return updated;
    }

    @Override
    @Transactional
    public void deleteReclamation(Long id) {
        if (!reclamationRepository.existsById(id)) {
            throw new RuntimeException("Reclamation not found with id: " + id);
        }
        reclamationRepository.deleteById(id);
        log.info("Reclamation deleted with id: {}", id);
    }
}