package esprit.microservice1.repositories;

import esprit.microservice1.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRespository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByIdKeycloak(String idKeycloak);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
