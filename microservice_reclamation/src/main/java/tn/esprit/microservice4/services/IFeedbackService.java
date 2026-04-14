package tn.esprit.microservice4.services;

import tn.esprit.microservice4.entities.Feedback;

import java.util.List;

public interface IFeedbackService {
    Feedback createFeedback(Feedback feedback);

    Feedback getFeedbackById(Long id);

    List<Feedback> getAllFeedbacks();

    List<Feedback> getFeedbacksByEventId(String eventId);

    List<Feedback> getFeedbacksByUserId(Long userId);

    Feedback updateFeedback(Long id, Feedback feedback);

    void deleteFeedback(Long id);

    // OpenFeign - enriched methods
    Feedback getFeedbackWithEvent(Long id);

    List<Feedback> getAllFeedbacksWithEvents();
}
