package esprit.microservice2.repositories;

import esprit.microservice2.entities.Category;
import esprit.microservice2.entities.InteractionType;
import esprit.microservice2.entities.Product;
import esprit.microservice2.entities.ProductInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ProductInteractionRepository extends JpaRepository<ProductInteraction, Long> {

    // Récupérer les catégories des produits avec lesquels l'utilisateur a interagi
    @Query("SELECT DISTINCT p.category FROM ProductInteraction pi JOIN pi.product p WHERE pi.userId = :userId")
    List<Category> findInteractedCategoriesByUserId(@Param("userId") String userId);

    // Récupérer tous les tags des produits avec lesquels l'utilisateur a interagi
    @Query("SELECT DISTINCT t FROM ProductInteraction pi JOIN pi.product p JOIN p.tags t WHERE pi.userId = :userId")
    List<String> findInteractedTagsByUserId(@Param("userId") String userId);

    // Récupérer les IDs des produits déjà vus/favoris par l'utilisateur
    @Query("SELECT DISTINCT p.id FROM ProductInteraction pi JOIN pi.product p WHERE pi.userId = :userId")
    List<Long> findInteractedProductIdsByUserId(@Param("userId") String userId);

    // Compter les interactions par produit (pour produits populaires)
    @Query("SELECT pi.product, COUNT(pi) as interactionCount FROM ProductInteraction pi " +
            "WHERE pi.createdAt >= :since " +
            "GROUP BY pi.product " +
            "ORDER BY interactionCount DESC")
    List<Object[]> findMostInteractedProducts(@Param("since") LocalDateTime since);

    // Compter les interactions par type (pour analytics)
    @Query("SELECT pi.type, COUNT(pi) FROM ProductInteraction pi WHERE pi.userId = :userId GROUP BY pi.type")
    List<Object[]> countInteractionsByTypeForUser(@Param("userId") String userId);
}

