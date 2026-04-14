package esprit.microservice2.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_interactions",
        indexes = {
                @Index(name = "idx_interaction_user", columnList = "user_id"),
                @Index(name = "idx_interaction_product", columnList = "product_id"),
                @Index(name = "idx_interaction_created", columnList = "created_at")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private InteractionType type;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}

