package esprit.microservice2.services;

import esprit.microservice2.entities.*;
import esprit.microservice2.repositories.ProductInteractionRepository;
import esprit.microservice2.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final ProductInteractionRepository interactionRepository;
    private final ProductRepository productRepository;

    /**
     * Enregistrer un clic sur un produit
     */
    @Transactional
    public void recordClick(String userId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable avec id: " + productId));

        ProductInteraction interaction = ProductInteraction.builder()
                .userId(userId)
                .product(product)
                .type(InteractionType.CLICK)
                .createdAt(LocalDateTime.now())
                .build();

        interactionRepository.save(interaction);
        log.info("Click enregistré pour userId={}, productId={}", userId, productId);
    }

    /**
     * Enregistrer un ajout aux favoris
     */
    @Transactional
    public void recordFavorite(String userId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable avec id: " + productId));

        ProductInteraction interaction = ProductInteraction.builder()
                .userId(userId)
                .product(product)
                .type(InteractionType.FAVORITE)
                .createdAt(LocalDateTime.now())
                .build();

        interactionRepository.save(interaction);
        log.info("Favori enregistré pour userId={}, productId={}", userId, productId);
    }

    /**
     * Recommandations personnalisées basées sur l'historique utilisateur
     * Algorithme : similarité par catégorie + tags
     */
    @Transactional(readOnly = true)
    public List<Product> getPersonalizedRecommendations(String userId, int limit) {
        // 1. Récupérer les IDs des produits déjà vus/favoris par l'utilisateur
        List<Long> interactedProductIds = interactionRepository.findInteractedProductIdsByUserId(userId);

        if (interactedProductIds.isEmpty()) {
            // Si aucune interaction, retourner les produits populaires
            log.info("Aucune interaction pour userId={}, retour des produits populaires", userId);
            return getPopularProducts(limit);
        }

        // 2. Récupérer les catégories préférées de l'utilisateur
        List<Category> preferredCategories = interactionRepository.findInteractedCategoriesByUserId(userId);

        // 3. Récupérer les tags préférés de l'utilisateur
        List<String> preferredTags = interactionRepository.findInteractedTagsByUserId(userId);

        // 4. Construire la liste de recommandations
        Map<Long, Product> recommendedProducts = new LinkedHashMap<>();

        // 4a. Recommander par tags (priorité haute car plus spécifique)
        if (!preferredTags.isEmpty()) {
            List<Product> productsByTags = productRepository.findByTagsInAndIdNotIn(
                    preferredTags,
                    interactedProductIds.isEmpty() ? Collections.singletonList(-1L) : interactedProductIds
            );
            productsByTags.stream()
                    .filter(p -> p.getStatus() && p.getStock() > 0)
                    .forEach(p -> recommendedProducts.put(p.getId(), p));
        }

        // 4b. Recommander par catégorie si on n'a pas assez de résultats
        if (recommendedProducts.size() < limit && !preferredCategories.isEmpty()) {
            for (Category category : preferredCategories) {
                if (recommendedProducts.size() >= limit) break;

                List<Product> productsByCategory = productRepository.findByCategoryAndIdNotIn(
                        category,
                        interactedProductIds.isEmpty() ? Collections.singletonList(-1L) : interactedProductIds
                );
                productsByCategory.stream()
                        .filter(p -> p.getStatus() && p.getStock() > 0)
                        .filter(p -> !recommendedProducts.containsKey(p.getId()))
                        .forEach(p -> recommendedProducts.put(p.getId(), p));
            }
        }

        // 5. Limiter et retourner
        List<Product> recommendations = new ArrayList<>(recommendedProducts.values());
        log.info("Recommandations pour userId={}: {} produits trouvés", userId, recommendations.size());

        return recommendations.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Produits populaires (basés sur les interactions récentes)
     */
    @Transactional(readOnly = true)
    public List<Product> getPopularProducts(int limit) {
        // Produits avec le plus d'interactions dans les 30 derniers jours
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<Object[]> results = interactionRepository.findMostInteractedProducts(since);

        List<Product> popularProducts = results.stream()
                .map(row -> (Product) row[0])
                .filter(p -> p.getStatus() && p.getStock() > 0)
                .limit(limit)
                .collect(Collectors.toList());

        // Si pas assez de résultats, compléter avec des produits récents
        if (popularProducts.size() < limit) {
            List<Product> recentProducts = productRepository.findByStatusTrueAndStockGreaterThan(0);
            recentProducts.stream()
                    .filter(p -> !popularProducts.contains(p))
                    .limit(limit - popularProducts.size())
                    .forEach(popularProducts::add);
        }

        log.info("Produits populaires: {} produits retournés", popularProducts.size());
        return popularProducts;
    }

    /**
     * Statistiques d'interactions pour un utilisateur
     */
    @Transactional(readOnly = true)
    public Map<String, Long> getUserInteractionStats(String userId) {
        List<Object[]> stats = interactionRepository.countInteractionsByTypeForUser(userId);

        Map<String, Long> result = new HashMap<>();
        result.put("CLICK", 0L);
        result.put("FAVORITE", 0L);

        for (Object[] row : stats) {
            InteractionType type = (InteractionType) row[0];
            Long count = (Long) row[1];
            result.put(type.name(), count);
        }

        return result;
    }
}

