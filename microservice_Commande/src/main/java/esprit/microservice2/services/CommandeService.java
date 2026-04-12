package esprit.microservice2.services;

import esprit.microservice2.entities.Commande;
import esprit.microservice2.entities.LigneCommande;
import esprit.microservice2.repositories.CommandeRepository;
import esprit.microservice2.repositories.LigneCommandeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CommandeService implements ICommandeService {
    @Autowired
    private CommandeRepository commandeRepository;

    @Autowired
    private LigneCommandeRepository ligneCommandeRepository;

    @Override
    public Commande createCommande(Commande c) {
        if (c == null) {
            throw new IllegalArgumentException("La commande ne peut pas être nulle");
        }
        if (c.getClientId() == null || c.getClientId().isBlank()) {
            throw new IllegalArgumentException("L'identifiant client est obligatoire");
        }
        if (c.getClientName() == null || c.getClientName().isEmpty()) {
            throw new IllegalArgumentException("Le nom du client est obligatoire");
        }

        if (c.getLignesCommande() != null) {
            for (LigneCommande ligne : c.getLignesCommande()) {
                if (ligne.getQuantite() == null || ligne.getQuantite() <= 0) {
                    throw new IllegalArgumentException("Chaque ligne doit avoir une quantité supérieure à 0");
                }
                if (ligne.getPrixUnitaire() == null || ligne.getPrixUnitaire().compareTo(BigDecimal.ZERO) < 0) {
                    throw new IllegalArgumentException("Chaque ligne doit avoir un prix unitaire valide");
                }
                ligne.setCommande(c);
            }
        }

        try {
            if (c.getStatus() == null || c.getStatus().isBlank()) {
                c.setStatus("processing");
            }

            if (c.getPrixTotal() == null && c.getLignesCommande() != null && !c.getLignesCommande().isEmpty()) {
                BigDecimal total = c.getLignesCommande()
                        .stream()
                        .map(ligne -> ligne.getPrixUnitaire().multiply(BigDecimal.valueOf(ligne.getQuantite())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                c.setPrixTotal(total);
            }

            return commandeRepository.save(c);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création de la commande: " + e.getMessage());
        }
    }

    @Override
    public Commande updatestatusCommande(Long id, String status) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("L'ID de la commande doit être valide");
        }
        if (status == null || status.isEmpty()) {
            throw new IllegalArgumentException("Le status est obligatoire");
        }

        Commande commande = commandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée avec l'ID: " + id));

        try {
            commande.setStatus(status);
            return commandeRepository.save(commande);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la mise à jour du status de la commande: " + e.getMessage());
        }
    }

    @Override
    public void deleteCommande(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("L'ID de la commande doit être valide");
        }
        if (!commandeRepository.existsById(id)) {
            throw new RuntimeException("Commande non trouvée avec l'ID: " + id);
        }
        try {
            commandeRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la suppression de la commande: " + e.getMessage());
        }
    }

    @Override
    public Commande getCommandeById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("L'ID de la commande doit être valide");
        }
        return commandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée avec l'ID: " + id));
    }

    @Override
    public List<Commande> getAllCommandes() {
        return commandeRepository.findAll();
    }

    @Override
    public List<Commande> getCommandesByClientId(String clientId) {
        if (clientId == null || clientId.isBlank()) {
            throw new IllegalArgumentException("L'identifiant client est obligatoire");
        }
        return commandeRepository.findByClientIdOrderByCreatedAtDesc(clientId);
    }

    @Override
    public Commande addLigneCommandeToCommande(Long commandeId, Long ligneCommandeId) {
        if (commandeId == null || commandeId <= 0) {
            throw new IllegalArgumentException("L'ID de la commande doit être valide");
        }
        if (ligneCommandeId == null || ligneCommandeId <= 0) {
            throw new IllegalArgumentException("L'ID de la ligne de commande doit être valide");
        }

        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée avec l'ID: " + commandeId));

        LigneCommande ligneCommande = ligneCommandeRepository.findById(ligneCommandeId)
                .orElseThrow(() -> new RuntimeException("Ligne de commande non trouvée avec l'ID: " + ligneCommandeId));

        try {
            commande.addLigneCommande(ligneCommande);
            return commandeRepository.save(commande);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'ajout de la ligne de commande: " + e.getMessage());
        }
    }
}
