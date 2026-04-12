package esprit.microservice2.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@ToString
public class Commande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clientId;
    private String clientName;
    private String clientAddress;
    private String clientPhone;
    private BigDecimal prixTotal;
    private String status;
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<LigneCommande> lignesCommande = new ArrayList<>();

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null || status.isBlank()) {
            status = "processing";
        }
    }

    public void addLigneCommande(LigneCommande ligne) {
        lignesCommande.add(ligne);
        ligne.setCommande(this);
    }

    public void removeLigneCommande(LigneCommande ligne) {
        lignesCommande.remove(ligne);
        ligne.setCommande(null);
    }
}
