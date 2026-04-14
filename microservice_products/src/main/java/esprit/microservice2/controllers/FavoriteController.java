package esprit.microservice2.controllers;

import esprit.microservice2.entities.Product;
import esprit.microservice2.services.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping("/{productId}")
    public ResponseEntity<String> addToFavorites(@PathVariable Long productId,
                                                 @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(favoriteService.addToFavorites(userId, productId));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<String> removeFromFavorites(@PathVariable Long productId,
                                                      @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(favoriteService.removeFromFavorites(userId, productId));
    }

    @GetMapping
    public ResponseEntity<List<Product>> getFavorites(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(favoriteService.getFavorites(userId));
    }

    // ✅ Compter le nombre de favoris de l'utilisateur connecté
    @GetMapping("/count")
    public ResponseEntity<Long> countFavorites(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(favoriteService.countFavorites(userId));
    }

    // Ton front fait GET et si ça passe => true, sinon => false
    @GetMapping("/{productId}")
    public ResponseEntity<Void> checkIfFavorite(@PathVariable Long productId,
                                                @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        boolean isFav = favoriteService.isFavorite(userId, productId);
        return isFav ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}
