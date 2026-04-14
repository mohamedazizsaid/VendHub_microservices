package tn.esprit.microservice4.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.microservice4.clients.EventClient;
import tn.esprit.microservice4.dto.EventDTO;
import tn.esprit.microservice4.entities.Feedback;
import tn.esprit.microservice4.repositories.FeedbackRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackServiceImpl implements IFeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final EventClient eventClient;

    @Override
    @Transactional
    public Feedback createFeedback(Feedback feedback) {
        if (feedback == null) {
            throw new RuntimeException("Feedback payload is required");
        }

        if (feedback.getEventId() == null || feedback.getEventId().trim().isEmpty()) {
            throw new RuntimeException("eventId is required");
        }

        if (feedback.getUserId() == null) {
            throw new RuntimeException("userId is required");
        }

        if (feedback.getRating() == null || feedback.getRating() < 1 || feedback.getRating() > 5) {
            throw new RuntimeException("rating must be between 1 and 5");
        }

        // Validate event exists via OpenFeign before creating feedback
        if (feedback.getEventId() != null) {
            try {
                EventDTO event = eventClient.getEventById(feedback.getEventId());
                log.info("Event validated via OpenFeign: {} ({})", event.getName(), event.get_id());
            } catch (Exception e) {
                log.error("Event validation failed for eventId: {}", feedback.getEventId(), e);
                throw new RuntimeException("Event not found with id: " + feedback.getEventId());
            }
        }
        Feedback saved = feedbackRepository.save(feedback);
        log.info("Feedback created with id: {}", saved.getId());
        return saved;
    }

    @Override
    public Feedback getFeedbackById(Long id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + id));
    }

    @Override
    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAll();
    }

    @Override
    public List<Feedback> getFeedbacksByEventId(String eventId) {
        return feedbackRepository.findByEventId(eventId);
    }

    @Override
    public List<Feedback> getFeedbacksByUserId(Long userId) {
        return feedbackRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public Feedback updateFeedback(Long id, Feedback feedback) {
        Feedback existing = getFeedbackById(id);
        if (feedback.getRating() != null) {
            existing.setRating(feedback.getRating());
        }
        if (feedback.getComment() != null) {
            existing.setComment(feedback.getComment());
        }
        Feedback updated = feedbackRepository.save(existing);
        log.info("Feedback updated with id: {}", updated.getId());
        return updated;
    }

    @Override
    @Transactional
    public void deleteFeedback(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new RuntimeException("Feedback not found with id: " + id);
        }
        feedbackRepository.deleteById(id);
        log.info("Feedback deleted with id: {}", id);
    }

    // ---- OpenFeign enriched methods ----

    @Override
    public Feedback getFeedbackWithEvent(Long id) {
        Feedback feedback = getFeedbackById(id);
        enrichWithEvent(feedback);
        return feedback;
    }

    @Override
    public List<Feedback> getAllFeedbacksWithEvents() {
        List<Feedback> feedbacks = feedbackRepository.findAll();
        feedbacks.forEach(this::enrichWithEvent);
        return feedbacks;
    }

    private void enrichWithEvent(Feedback feedback) {
        if (feedback.getEventId() != null) {
            try {
                EventDTO event = eventClient.getEventById(feedback.getEventId());
                feedback.setEvent(event);
            } catch (Exception e) {
                log.warn("Could not fetch event {} for feedback {}: {}",
                        feedback.getEventId(), feedback.getId(), e.getMessage());
            }
        }
    }
}
