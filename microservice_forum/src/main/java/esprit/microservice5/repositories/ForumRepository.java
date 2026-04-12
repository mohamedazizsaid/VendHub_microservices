package esprit.microservice5.repositories;

import esprit.microservice5.entities.Forum;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ForumRepository extends JpaRepository<Forum, Long> {
}
