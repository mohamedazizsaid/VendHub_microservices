package esprit.microservice2.services;

import esprit.microservice2.entities.Product;

import java.util.List;

public interface IProductService {

    public List<Product> getAllProducts();
    public Product getProductById(Long id);
    public Product saveProduct(Product product);
    public Product updateProduct(Long id, Product product);
    public void deleteProduct(Long id);


}
