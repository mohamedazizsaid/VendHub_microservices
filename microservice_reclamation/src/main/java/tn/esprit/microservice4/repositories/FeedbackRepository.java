package tn.esprit.microservice4.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.microservice4.entities.Feedback;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByEventId(String eventId);

    List<Feedback> findByUserId(Long userId);
}
