    package esprit.microservice2.services;

    import esprit.microservice2.entities.Product;
    import esprit.microservice2.repositories.ProductRepository;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.stereotype.Service;

    import java.time.LocalDateTime;
    import java.util.List;
    import java.util.Optional;

    @Service
    public class ProductServiceImp implements IProductService {
        @Autowired
        private ProductRepository productRepository;

        @Override
        public List<Product> getAllProducts() {
            try {
                List<Product> products = productRepository.findAll();
                if (products.isEmpty()) {
                    throw new RuntimeException("Aucun produit trouvé");
                }
                return products;
            } catch (Exception e) {
                throw new RuntimeException("Erreur lors de la récupération des produits: " + e.getMessage());
            }
        }

        @Override
        public Product getProductById(Long id) {
            if (id == null || id <= 0) {
                throw new IllegalArgumentException("L'ID du produit doit être valide");
            }
            return productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Produit non trouvé avec l'ID: " + id));
        }


        @Override
        public Product saveProduct(Product product) {
            if (product == null || product.getName() == null || product.getName().isEmpty()) {
                throw new IllegalArgumentException("Le produit et son nom sont obligatoires");
            }

            product.setStatus(product.getStock() != null && product.getStock() > 0);
            product.setCreatedAt(product.getCreatedAt() != null ? product.getCreatedAt() : LocalDateTime.now());

            return productRepository.save(product);
        }




        @Override
        public Product updateProduct(Long id, Product product) {
            if (id == null || id <= 0) {
                throw new IllegalArgumentException("L'ID du produit doit être valide");
            }

            Product existing = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Produit non trouvé avec l'ID: " + id));

            // ✅ Mise à jour des champs (évite d’écraser avec null)
            existing.setName(product.getName());
            existing.setDescription(product.getDescription());
            existing.setImageUrl(product.getImageUrl());
            existing.setPrice(product.getPrice());
            existing.setCategory(product.getCategory());
            existing.setStock(product.getStock());
            existing.setCreatedAt(product.getCreatedAt()); // optionnel (souvent on ne modifie pas createdAt)

            // ✅ Status automatique basé sur stock
            existing.setStatus(existing.getStock() != null && existing.getStock() > 0);

            return productRepository.save(existing);
        }



        @Override
        public void deleteProduct(Long id) {
            if (id == null || id <= 0) {
                throw new IllegalArgumentException("L'ID du produit doit être valide");
            }
            if (!productRepository.existsById(id)) {
                throw new RuntimeException("Produit non trouvé avec l'ID: " + id);
            }
            try {
                productRepository.deleteById(id);
            } catch (Exception e) {
                throw new RuntimeException("Erreur lors de la suppression du produit: " + e.getMessage());
            }
        }
    }
