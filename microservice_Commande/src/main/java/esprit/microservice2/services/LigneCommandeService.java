package esprit.microservice2.services;

import esprit.microservice2.entities.LigneCommande;
import esprit.microservice2.repositories.LigneCommandeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LigneCommandeService implements ILigneCommandeService {
    @Autowired
    private LigneCommandeRepository ligneCommandeRepository;

    @Override
    public LigneCommande createLigneCommande(LigneCommande lc) {
        if (lc == null) {
            throw new IllegalArgumentException("La ligne de commande ne peut pas être nulle");
        }
        if (lc.getNomProduit() == null || lc.getNomProduit().isEmpty()) {
            throw new IllegalArgumentException("Le nom du produit est obligatoire");
        }
        if (lc.getQuantite() == null || lc.getQuantite() <= 0) {
            throw new IllegalArgumentException("La quantité doit être supérieure à zéro");
        }
        try {
            return ligneCommandeRepository.save(lc);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création de la ligne de commande: " + e.getMessage());
        }
    }

    @Override
    public LigneCommande updateQuantiteLigneCommande(LigneCommande lc) {
        if (lc == null || lc.getId() == null || lc.getId() <= 0) {
            throw new IllegalArgumentException("La ligne de commande et son ID doivent être valides");
        }
        if (lc.getQuantite() == null || lc.getQuantite() <= 0) {
            throw new IllegalArgumentException("La quantité doit être supérieure à zéro");
        }

        LigneCommande existingLigne = ligneCommandeRepository.findById(lc.getId())
                .orElseThrow(() -> new RuntimeException("Ligne de commande non trouvée avec l'ID: " + lc.getId()));

        try {
            existingLigne.setQuantite(lc.getQuantite());
            return ligneCommandeRepository.save(existingLigne);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la mise à jour de la quantité: " + e.getMessage());
        }
    }

    @Override
    public void deleteLigneCommande(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("L'ID de la ligne de commande doit être valide");
        }
        if (!ligneCommandeRepository.existsById(id)) {
            throw new RuntimeException("Ligne de commande non trouvée avec l'ID: " + id);
        }
        try {
            ligneCommandeRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la suppression de la ligne de commande: " + e.getMessage());
        }
    }
}
