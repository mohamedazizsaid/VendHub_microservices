package esprit.microservice1.repositories;

import esprit.microservice1.entities.PasswordResetCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, Long> {
    Optional<PasswordResetCode> findTopByEmailAndCodeAndUsedFalseOrderByCreatedAtDesc(String email, String code);

    void deleteByExpiresAtBefore(LocalDateTime instant);
}
