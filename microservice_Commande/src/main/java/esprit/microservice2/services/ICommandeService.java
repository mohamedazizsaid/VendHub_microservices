package esprit.microservice2.services;

import esprit.microservice2.entities.Commande;

public interface ICommandeService {

    public Commande createCommande(Commande c);
    public Commande updatestatusCommande(Long id, String status);
    public void deleteCommande(Long id);
    public Commande getCommandeById(Long id);
    public Commande addLigneCommandeToCommande(Long commandeId, Long ligneCommandeId);
}
