package esprit.microservice2.services;

import esprit.microservice2.entities.Commande;

import java.util.List;

public interface ICommandeService {

    public Commande createCommande(Commande c);

    public Commande updatestatusCommande(Long id, String status);

    public void deleteCommande(Long id);

    public Commande getCommandeById(Long id);

    public List<Commande> getAllCommandes();

    public List<Commande> getCommandesByClientId(String clientId);

    public Commande addLigneCommandeToCommande(Long commandeId, Long ligneCommandeId);
}
