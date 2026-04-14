package esprit.microservice2.repositories;

import esprit.microservice2.entities.Favorite;
import esprit.microservice2.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    boolean existsByUserIdAndProduct_Id(String userId, Long productId);

    Optional<Favorite> findByUserIdAndProduct_Id(String userId, Long productId);

    void deleteByUserIdAndProduct_Id(String userId, Long productId);

    // ✅ Retourner directement les produits favoris (évite LAZY)
    @Query("select f.product from Favorite f where f.userId = :userId order by f.createdAt desc")
    List<Product> findFavoriteProductsByUserId(@Param("userId") String userId);

    // ✅ Compter le nombre de favoris d'un utilisateur
    long countByUserId(String userId);
}
