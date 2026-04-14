package tn.esprit.microservice4.services;

import tn.esprit.microservice4.entities.Reclamation;

import java.util.List;

public interface IReclamationService {

    Reclamation createReclamation(Reclamation reclamation);

    Reclamation getReclamationById(Long id);

    List<Reclamation> getAllReclamations();

    List<Reclamation> getReclamationsByUserId(Long userId);

    // Recherches par id de commande
    List<Reclamation> getReclamationsByCommandeId(Long commandeId);

    List<Reclamation> getReclamationsByStatus(String status);

    Reclamation updateReclamation(Long id, Reclamation reclamation);

    void deleteReclamation(Long id);
}