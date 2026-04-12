package esprit.microservice2.controllers;

import esprit.microservice2.entities.Product;
import esprit.microservice2.services.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * POST /api/products/{id}/click
     * Enregistrer un clic sur un produit
     */
    @PostMapping("/{id}/click")
    public ResponseEntity<Map<String, String>> recordClick(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        recommendationService.recordClick(userId, id);
        return ResponseEntity.ok(Map.of(
                "message", "Clic enregistré avec succès",
                "productId", id.toString(),
                "userId", userId
        ));
    }

    /**
     * POST /api/products/{id}/favorite
     * Enregistrer un ajout aux favoris (interaction)
     * Note: Ceci enregistre l'interaction, le FavoriteController gère la liste favoris réelle
     */
    @PostMapping("/{id}/favorite")
    public ResponseEntity<Map<String, String>> recordFavorite(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        recommendationService.recordFavorite(userId, id);
        return ResponseEntity.ok(Map.of(
                "message", "Favori enregistré avec succès",
                "productId", id.toString(),
                "userId", userId
        ));
    }

    /**
     * GET /api/products/recommendations
     * Recommandations personnalisées basées sur l'historique utilisateur
     * Paramètre optionnel: limit (défaut: 10)
     */
    @GetMapping("/recommendations")
    public ResponseEntity<List<Product>> getPersonalizedRecommendations(
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        List<Product> recommendations = recommendationService.getPersonalizedRecommendations(userId, limit);
        return ResponseEntity.ok(recommendations);
    }

    /**
     * GET /api/products/popular
     * Produits populaires (basés sur interactions récentes)
     * Accessible sans authentification
     */
    @GetMapping("/popular")
    public ResponseEntity<List<Product>> getPopularProducts(
            @RequestParam(defaultValue = "10") int limit) {
        List<Product> popularProducts = recommendationService.getPopularProducts(limit);
        return ResponseEntity.ok(popularProducts);
    }

    /**
     * GET /api/products/my-stats
     * Statistiques d'interactions de l'utilisateur connecté
     */
    @GetMapping("/my-stats")
    public ResponseEntity<Map<String, Long>> getMyInteractionStats(
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        Map<String, Long> stats = recommendationService.getUserInteractionStats(userId);
        return ResponseEntity.ok(stats);
    }
}

