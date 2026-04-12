package esprit.microservice2.services;

import esprit.microservice2.entities.Favorite;
import esprit.microservice2.entities.Product;
import esprit.microservice2.repositories.FavoriteRepository;
import esprit.microservice2.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;
    private final RecommendationService recommendationService;

    @Transactional
    public String addToFavorites(String userId, Long productId) {
        if (favoriteRepository.existsByUserIdAndProduct_Id(userId, productId)) {
            return "Ce produit est déjà dans votre liste de favoris.";
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable avec id: " + productId));

        Favorite favorite = Favorite.builder()
                .userId(userId)
                .product(product)
                .createdAt(LocalDateTime.now())
                .build();

        favoriteRepository.save(favorite);

        // Enregistrer l'interaction pour les recommandations
        recommendationService.recordFavorite(userId, productId);

        return "Produit ajouté aux favoris avec succès.";
    }

    @Transactional
    public String removeFromFavorites(String userId, Long productId) {
        Favorite fav = favoriteRepository.findByUserIdAndProduct_Id(userId, productId).orElse(null);

        if (fav == null) {
            return "Ce produit n'est pas dans votre liste de favoris.";
        }

        favoriteRepository.delete(fav);
        return "Produit supprimé des favoris avec succès.";
    }

    @Transactional(readOnly = true)
    public List<Product> getFavorites(String userId) {
        return favoriteRepository.findFavoriteProductsByUserId(userId);
    }

    @Transactional(readOnly = true)
    public boolean isFavorite(String userId, Long productId) {
        return favoriteRepository.existsByUserIdAndProduct_Id(userId, productId);
    }

    @Transactional(readOnly = true)
    public long countFavorites(String userId) {
        return favoriteRepository.countByUserId(userId);
    }
}
