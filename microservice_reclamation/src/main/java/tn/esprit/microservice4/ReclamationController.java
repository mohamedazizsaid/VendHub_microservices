package tn.esprit.microservice4;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.microservice4.entities.Reclamation;
import tn.esprit.microservice4.services.IReclamationService;

import java.util.List;

@RestController
@RequestMapping("/api/reclamations")
public class ReclamationController {

    private final IReclamationService reclamationService;

    @Autowired
    public ReclamationController(IReclamationService reclamationService) {
        this.reclamationService = reclamationService;
    }

    @PostMapping
    public ResponseEntity<Reclamation> createReclamation(@RequestBody Reclamation reclamation) {
        try {
            Reclamation created = reclamationService.createReclamation(reclamation);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reclamation> getReclamationById(@PathVariable Long id) {
        try {
            Reclamation reclamation = reclamationService.getReclamationById(id);
            return ResponseEntity.ok(reclamation);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Reclamation>> getAllReclamations() {
        List<Reclamation> reclamations = reclamationService.getAllReclamations();
        return ResponseEntity.ok(reclamations);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reclamation>> getReclamationsByUserId(@PathVariable Long userId) {
        List<Reclamation> reclamations = reclamationService.getReclamationsByUserId(userId);
        return ResponseEntity.ok(reclamations);
    }

    @GetMapping("/commande/{commandeId}")
    public ResponseEntity<List<Reclamation>> getReclamationsByCommandeId(@PathVariable Long commandeId) {
        List<Reclamation> reclamations = reclamationService.getReclamationsByCommandeId(commandeId);
        return ResponseEntity.ok(reclamations);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Reclamation>> getReclamationsByStatus(@PathVariable String status) {
        List<Reclamation> reclamations = reclamationService.getReclamationsByStatus(status);
        return ResponseEntity.ok(reclamations);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reclamation> updateReclamation(
            @PathVariable Long id,
            @RequestBody Reclamation reclamation) {
        try {
            Reclamation updated = reclamationService.updateReclamation(id, reclamation);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReclamation(@PathVariable Long id) {
        try {
            reclamationService.deleteReclamation(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}