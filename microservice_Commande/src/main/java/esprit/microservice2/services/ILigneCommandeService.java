package esprit.microservice2.services;

import esprit.microservice2.entities.LigneCommande;

public interface ILigneCommandeService {

    public LigneCommande createLigneCommande(LigneCommande lc);
    public LigneCommande updateQuantiteLigneCommande(LigneCommande lc);
    public void deleteLigneCommande(Long id);

}
