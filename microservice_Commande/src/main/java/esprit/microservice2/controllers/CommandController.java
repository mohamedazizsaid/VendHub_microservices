package esprit.microservice2.controllers;

import esprit.microservice2.entities.Commande;
import esprit.microservice2.services.ICommandeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api6/commandes")
public class CommandController {

    @Autowired
    private ICommandeService commandeService;

    @PostMapping
    public ResponseEntity<?> createCommande(@RequestBody Commande commande) {
        try {
            Commande createdCommande = commandeService.createCommande(commande);
            createdCommande.setCreatedAt(java.time.LocalDateTime.now());
            return new ResponseEntity<>(createdCommande, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateCommandeStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Commande updatedCommande = commandeService.updatestatusCommande(id, status);
            return new ResponseEntity<>(updatedCommande, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCommande(@PathVariable Long id) {
        try {
            commandeService.deleteCommande(id);
            return new ResponseEntity<>("Commande supprimée avec succès", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCommandeById(@PathVariable Long id) {
        try {
            Commande commande = commandeService.getCommandeById(id);
            return new ResponseEntity<>(commande, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/{commandeId}/lignes/{ligneId}")
    public ResponseEntity<?> addLigneCommandeToCommande(
            @PathVariable Long commandeId,
            @PathVariable Long ligneId) {
        try {
            Commande updatedCommande = commandeService.addLigneCommandeToCommande(commandeId, ligneId);
            return new ResponseEntity<>(updatedCommande, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}
