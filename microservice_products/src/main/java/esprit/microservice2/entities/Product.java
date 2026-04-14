package esprit.microservice2.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor

public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String imageUrl;
    private BigDecimal price;
    @Enumerated(EnumType.STRING)
    private Category category;
    private Integer stock ;

    // Nouveau champ : Statut du produit (actif/inactif)
    @Column(nullable = false)
    private Boolean status = true; // Valeur par défaut : true (actif)

    private LocalDateTime createdAt;

    @ElementCollection
    @CollectionTable(name = "product_tags", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "tag")
    private Set<String> tags = new HashSet<>();

}
