package esprit.microservice2.repositories;

import esprit.microservice2.entities.Category;
import esprit.microservice2.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Trouver produits par catégorie
    List<Product> findByCategory(Category category);

    // Trouver produits par catégorie et excluant certains IDs
    List<Product> findByCategoryAndIdNotIn(Category category, List<Long> excludedIds);

    // Trouver produits contenant au moins un des tags
    @Query("SELECT DISTINCT p FROM Product p JOIN p.tags t WHERE t IN :tags AND p.id NOT IN :excludedIds")
    List<Product> findByTagsInAndIdNotIn(@Param("tags") List<String> tags, @Param("excludedIds") List<Long> excludedIds);

    // Trouver produits actifs et en stock
    List<Product> findByStatusTrueAndStockGreaterThan(Integer minStock);
}
