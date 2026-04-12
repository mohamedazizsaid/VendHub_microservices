package tn.esprit.microservice4.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import tn.esprit.microservice4.entities.Reclamation;
import tn.esprit.microservice4.repositories.ReclamationRepository;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReclamationServiceImpl implements IReclamationService {

    private final ReclamationRepository reclamationRepository;

    private final RestTemplate restTemplate;

    private final JavaMailSender mailSender;

    @Value("${reclamation.user-service-url:http://microservice1/api/auth/users}")
    private String userServiceUrl;

    @Value("${reclamation.notification.from:no-reply@eventshop.local}")
    private String notificationFrom;

    @Override
    @Transactional
    public Reclamation createReclamation(Reclamation reclamation) {
        // Vérifier que l'utilisateur existe via Eureka
        try {
            restTemplate.getForObject(
                    "http://microservice1-users/api/users/" + reclamation.getUserId(),
                    Object.class);
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
                    Object.class);
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
        String previousStatus = existing.getStatus();

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

        if (isNowTreated(previousStatus, updated.getStatus())) {
            notifyReclaimerByEmail(updated);
        }

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

    private boolean isNowTreated(String oldStatus, String newStatus) {
        String previous = oldStatus == null ? "" : oldStatus.trim().toUpperCase();
        String current = newStatus == null ? "" : newStatus.trim().toUpperCase();
        boolean currentIsTreated = "RESOLVED".equals(current) || "CLOSED".equals(current);
        boolean previousWasTreated = "RESOLVED".equals(previous) || "CLOSED".equals(previous);
        return currentIsTreated && !previousWasTreated;
    }

    private void notifyReclaimerByEmail(Reclamation reclamation) {
        String userEmail = resolveUserEmail(reclamation.getUserId());
        if (userEmail == null || userEmail.isBlank()) {
            log.warn("No email found for user {}. Notification skipped for reclamation {}",
                    reclamation.getUserId(), reclamation.getId());
            return;
        }

        String safeStatus = reclamation.getStatus() == null ? "RESOLVED" : reclamation.getStatus();
        String safeTitle = reclamation.getTitle() == null ? "Your reclamation" : reclamation.getTitle();
        String safeReply = reclamation.getReply() == null || reclamation.getReply().isBlank()
                ? "Our support team has processed your request."
                : reclamation.getReply();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(notificationFrom);
        message.setTo(userEmail);
        message.setSubject("Reclamation Update - " + safeStatus);
        message.setText("Hello,\n\n"
                + "Your reclamation has been treated.\n"
                + "Title: " + safeTitle + "\n"
                + "Status: " + safeStatus + "\n\n"
                + "Support reply:\n"
                + safeReply + "\n\n"
                + "Thank you.");

        try {
            mailSender.send(message);
            log.info("Notification email sent to {} for reclamation {}", userEmail, reclamation.getId());
        } catch (MailException e) {
            log.error("Failed to send notification email for reclamation {}: {}",
                    reclamation.getId(), e.getMessage());
        }
    }

    private String resolveUserEmail(Long userId) {
        if (userId == null) {
            return null;
        }

        List<String> candidates = List.of(
                userServiceUrl + "/" + userId,
                "http://microservice1-users/api/users/" + userId,
                "http://microservice1/api/auth/users/" + userId);

        for (String url : candidates) {
            try {
                Object response = restTemplate.getForObject(url, Object.class);
                if (response instanceof Map<?, ?> map && map.get("email") != null) {
                    return String.valueOf(map.get("email"));
                }
            } catch (Exception e) {
                log.debug("Could not resolve user email from {}: {}", url, e.getMessage());
            }
        }

        return null;
    }
}