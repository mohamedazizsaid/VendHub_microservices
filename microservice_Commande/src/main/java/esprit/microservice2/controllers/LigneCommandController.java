package esprit.microservice2.controllers;

import esprit.microservice2.entities.LigneCommande;
import esprit.microservice2.services.ILigneCommandeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api6/lignes-commande")
@CrossOrigin(origins = "*")
public class LigneCommandController {

    @Autowired
    private ILigneCommandeService ligneCommandeService;

    @PostMapping
    public ResponseEntity<?> createLigneCommande(@RequestBody LigneCommande ligneCommande) {
        try {
            LigneCommande createdLigne = ligneCommandeService.createLigneCommande(ligneCommande);
            return new ResponseEntity<>(createdLigne, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuantiteLigneCommande(@PathVariable Long id,
            @RequestBody LigneCommande ligneCommande) {
        try {
            ligneCommande.setId(id);
            LigneCommande updatedLigne = ligneCommandeService.updateQuantiteLigneCommande(ligneCommande);
            return new ResponseEntity<>(updatedLigne, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLigneCommande(@PathVariable Long id) {
        try {
            ligneCommandeService.deleteLigneCommande(id);
            return new ResponseEntity<>("Ligne de commande supprimée avec succès", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}
